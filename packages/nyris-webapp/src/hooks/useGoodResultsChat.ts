/**
 * P3 - Good Results Conversation
 *
 * Handles multi-turn conversation when results match the uploaded image.
 * Helps user filter, compare, and identify within good results.
 * Never triggers new API searches - works within 100 results.
 */

import { useCallback, useRef } from 'react';
import useConversationStore, {
  QuickReplyOption,
  ActionType,
} from 'stores/chat/conversationStore';
import useSmartFiltersStore from 'stores/smartFilters/smartFiltersStore';
import useResultStore from 'stores/result/resultStore';
import useRequestStore from 'stores/request/requestStore';
import { chatAnalysis } from 'services/vizo';
import {
  fetchProductImageBase64,
  getProductImageUrl,
} from 'utils/fetchProductImage';

/**
 * Extracts search keywords from a user's natural language description.
 * Strips filler words and keeps product-relevant terms.
 * e.g. "looking for a green color bulb shaped object" → "green bulb"
 * e.g. "I need a Schneider Electric 24V blue LED indicator light" → "Schneider Electric 24V blue LED indicator light"
 */
function extractSearchKeywords(description: string): string {
  const stopWords = new Set([
    'i',
    'me',
    'my',
    'am',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'a',
    'an',
    'the',
    'and',
    'or',
    'but',
    'if',
    'of',
    'at',
    'by',
    'for',
    'with',
    'to',
    'from',
    'in',
    'on',
    'it',
    'its',
    'this',
    'that',
    'these',
    'those',
    'do',
    'does',
    'did',
    'have',
    'has',
    'had',
    'will',
    'would',
    'could',
    'should',
    'can',
    'may',
    'might',
    'shall',
    'need',
    'want',
    'like',
    'looking',
    'find',
    'search',
    'show',
    'get',
    'please',
    'help',
    'something',
    'thing',
    'object',
    'item',
    'product',
    'part',
    'component',
    'piece',
    'one',
    'some',
    'any',
    'very',
    'really',
    'just',
    'also',
    'too',
    'so',
    'not',
    'no',
    'yes',
    'color',
    'colour',
    'colored',
    'coloured',
    'shaped',
    'type',
    'kind',
    'sort',
    'similar',
    'same',
    'look',
    'looks',
    'looking',
  ]);

  const words = description
    .trim()
    .replace(/[.,!?;:'"()[\]{}]/g, '')
    .split(/\s+/)
    .filter(w => !stopWords.has(w.toLowerCase()));

  // Prioritize: numbers/IDs first (likely product codes), then other keywords
  const numbers = words.filter(w => /\d/.test(w));
  const nonNumbers = words.filter(w => !/\d/.test(w));
  const prioritized = [...numbers, ...nonNumbers];

  // Keep at most 8 keywords
  return (
    prioritized.slice(0, 8).join(' ') ||
    description.trim().split(/\s+/).slice(0, 3).join(' ')
  );
}

interface P3Response {
  message: string;
  action: {
    type: ActionType;
    key?: string;
    value?: string;
    matched_ids?: string[];
    matched_indices?: number[]; // Legacy fallback
  };
  options: QuickReplyOption[];
}

export function useGoodResultsChat() {
  const {
    messages,
    activeFilters,
    addMessage,
    addFilter,
    removeFilter,
    clearFilters,
    setIsLoading,
    setError,
  } = useConversationStore();

  const { filters } = useSmartFiltersStore();

  const productsFromFindApi = useResultStore(
    state => state.productsFromFindApi,
  );
  const firstSearchResults = useResultStore(state => state.firstSearchResults);

  const setFindApiProducts = useResultStore(state => state.setFindApiProducts);
  const fullResultPool = useResultStore(state => state.fullResultPool);
  const setFullResultPool = useResultStore(state => state.setFullResultPool);
  const imageAnalysis = useResultStore(state => state.imageAnalysis);
  const setImageAnalysis = useResultStore(state => state.setImageAnalysis);
  const requestImages = useRequestStore(state => state.requestImages);

  const isAlgoliaEnabled = !!(window as any).settings?.algolia?.enabled;
  const activeProducts = productsFromFindApi;
  const setActiveProducts = setFindApiProducts;

  // Original unfiltered results — used for restoring and index-based filtering
  // Prefer fullResultPool (50 items) when available for broader filtering
  const originalProducts =
    fullResultPool.length > 0
      ? fullResultPool
      : firstSearchResults.length > 0
        ? firstSearchResults
        : activeProducts;

  // Image cache: persists across P3 messages within the same search session
  const imageCacheRef = useRef<Map<string, string | null>>(new Map());
  const lastSessionIdRef = useRef<string>('');

  const sendMessage = useCallback(
    async (userMessage: string, options?: { silent?: boolean }) => {
      if (!options?.silent) {
        addMessage({
          role: 'user',
          content: userMessage,
        });
      }

      setIsLoading(true);
      setError(null);

      try {
        // Build context for P3
        const specification = imageAnalysis?.specification || {};
        const imageDescription =
          imageAnalysis?.imageDescription || 'No description available';

        // Get P4 specification from smart filters
        const p4Specification: Record<string, string> = {};
        filters.forEach(f => {
          p4Specification[f.label.toLowerCase()] = f.value;
        });
        Object.entries(specification).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            p4Specification[key] = value;
          }
        });

        // Get all results for AI context — read fresh from store to avoid stale closure data
        const freshState = useResultStore.getState();
        const freshFullPool = freshState.fullResultPool;
        const freshFindApi = freshState.productsFromFindApi;
        const freshAlgolia = freshState.productsFromAlgolia;
        const freshActive = isAlgoliaEnabled
          ? freshAlgolia
          : freshAlgolia.length > 0
            ? freshAlgolia
            : freshFindApi;
        const freshOriginal =
          freshFullPool.length > 0 ? freshFullPool : freshActive;
        const poolForAI =
          freshOriginal.length > 0 ? freshOriginal : activeProducts;
        const visibleResults = poolForAI
          .slice(0, 30)
          .map((p: any, i: number) => {
            const title = p.title || p.name || '';

            return {
              id: p.sku || p.objectID || `product-${i}`,
              title: title || 'Untitled',
              brand: p.brand || '',
              description: (p.description || '').substring(0, 200),
              mpn: p.customIds?.mpn || p.ids?.mpn || '',
            };
          });

        // Analyze common attributes for filter suggestions
        const attributeFrequency: Record<string, Record<string, number>> = {};
        visibleResults.forEach(r => {
          // Track brand frequency
          if (r.brand) {
            if (!attributeFrequency['brand']) attributeFrequency['brand'] = {};
            attributeFrequency['brand'][r.brand] =
              (attributeFrequency['brand'][r.brand] || 0) + 1;
          }
          // Extract voltage from title/description
          const titleDesc = `${r.title} ${r.description}`;
          const voltageMatch = titleDesc.match(/(\d+)\s*V\s*(DC|AC)?/i);
          if (voltageMatch) {
            if (!attributeFrequency['voltage'])
              attributeFrequency['voltage'] = {};
            attributeFrequency['voltage'][voltageMatch[0]] =
              (attributeFrequency['voltage'][voltageMatch[0]] || 0) + 1;
          }
        });

        // Build conversation history — skip in silent mode to avoid re-applying old filters
        const conversationHistory = options?.silent
          ? []
          : messages.map(m => ({
              role: m.role,
              content: m.content,
            }));

        // Fetch product thumbnail images with caching — send images for ALL results (up to 50)
        // Cache persists across filter operations; only clears on new search session
        const productsForImages = poolForAI.slice(0, 30);
        const currentSessionId = useConversationStore.getState().sessionId;
        if (currentSessionId !== lastSessionIdRef.current) {
          imageCacheRef.current.clear();
          lastSessionIdRef.current = currentSessionId;
        }
        const imageResults = await Promise.all(
          productsForImages.map(async (p: any, i: number) => {
            const url = getProductImageUrl(p);

            if (!url) return { rank: i + 1, base64: null };

            const base64 = await fetchProductImageBase64(url);
            imageCacheRef.current.set(url, base64);
            return { rank: i + 1, base64 };
          }),
        );

        const imagesAvailable = imageResults.filter(
          r => r.base64 !== null,
        ).length;
        const hasVisualContext = imagesAvailable >= 3;

        // Build multimodal user parts: text context + product images interleaved with metadata
        const userParts: any[] = [];

        // Visual availability notice — prevents AI from hallucinating visual attributes
        const visualNotice = hasVisualContext
          ? `PRODUCT IMAGES: ${imagesAvailable} product thumbnail images are included below. Use them to evaluate visual attributes (color, shape, size, form factor).`
          : `PRODUCT IMAGES: NOT AVAILABLE — product images could not be loaded. Do NOT make claims about visual attributes like color, shape, or appearance. Only use text metadata for filtering. If the user asks about visual properties (color, shape, etc.), tell them you cannot evaluate visual attributes from the current data and suggest they search the full catalog instead.`;

        // Part 1: Text context
        userParts.push({
          text: `CONTEXT:

IMAGE DESCRIPTION: ${imageDescription}

SPECIFICATION (from image analysis):
${JSON.stringify(p4Specification, null, 2)}

ACTIVE FILTERS:
${activeFilters.length > 0 ? activeFilters.map(f => `${f.key}: ${f.value}`).join('\n') : 'None'}

AVAILABLE FILTER OPTIONS (based on actual product metadata - use these for suggestions):
${JSON.stringify(attributeFrequency, null, 2)}

${visualNotice}

PRODUCT LIST (up to 50 results — each has a unique ID in [brackets] and AI-generated TAGS for type/color/shape/material. Use TAGS for filtering — they are pre-analyzed from product images. Return matching IDs in matched_ids array):
`,
        });

        // Part 2: Product entries with interleaved images (for all results up to 50)
        visibleResults.forEach((r, i) => {
          // Include AI-generated tags if available (from useProductTagger)
          const originalProduct = poolForAI[i];
          const tags = originalProduct?._tags;
          const tagStr = tags
            ? ` | TAGS: type=${tags.productType}, color=${tags.color}, shape=${tags.shape}, material=${tags.material}`
            : '';
          const metaLine = `id: ${r.id} | ${r.title} | brand: ${r.brand} | mpn: ${r.mpn} | desc: ${r.description}${tagStr}`;

          // Include product image if available
          if (
            hasVisualContext &&
            i < imageResults.length &&
            imageResults[i]?.base64
          ) {
            userParts.push({
              text: metaLine,
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageResults[i].base64,
              },
            });
          } else {
            userParts.push({ text: metaLine });
          }
        });

        // Part 3: Remaining context
        userParts.push({
          text: `
Original_results_count: ${originalProducts.length}          
Current RESULTS: ${visibleResults.length}

CONVERSATION HISTORY:
${conversationHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

USER MESSAGE: ${userMessage}

Respond to the user's message with an appropriate action and follow-up options.`,
        });

        const response: P3Response = await chatAnalysis({
          promptKey: 'chat_assistant_prompt',
          multimodalInputs: userParts.map(part => ({
            metadata: part.text,
            image: part.inlineData?.data,
            mimeType: part.inlineData?.mimeType,
          })),
        });

        const responseText = response;

        // Parse the JSON response
        const p3Response: P3Response = responseText;

        // Silent mode: only suggest filters, never apply actions
        if (options?.silent && p3Response.action) {
          p3Response.action.type = 'none';
          p3Response.action.matched_ids = [];
          p3Response.action.matched_indices = undefined;
        }

        // Deterministic description detection via store flag
        const { awaitingDescription, setAwaitingDescription } =
          useConversationStore.getState();
        if (awaitingDescription && p3Response.action) {
          p3Response.action.type = 'text_search';
          p3Response.action.value = extractSearchKeywords(userMessage);
          p3Response.action.matched_indices = undefined;
          setAwaitingDescription(false);
        }

        // For any text_search action, ensure value contains extracted keywords, not raw description
        if (
          p3Response.action?.type === 'text_search' &&
          p3Response.action.value
        ) {
          const valWords = p3Response.action.value.trim().split(/\s+/);
          if (valWords.length > 8) {
            p3Response.action.value = extractSearchKeywords(
              p3Response.action.value,
            );
          }
        }

        // ===== SIMPLIFIED ACTION HANDLING =====
        // AI returns matched_ids (SKU/ID array). We look up products by ID from the pool.
        const sourcePool = poolForAI.slice(0, 30);
        let actualFilteredCount = 0;

        // Build a lookup map: ID → product
        const productById = new Map<string, any>();
        sourcePool.forEach((p: any) => {
          const id = p.sku || p.objectID || '';
          if (id) productById.set(String(id), p);
        });

        // Debug: log the map keys so we can see what IDs are available

        if (p3Response.action) {
          const { type, key, value } = p3Response.action;
          const matchedIds: string[] = p3Response.action.matched_ids || [];
          const matchedIndices: number[] =
            p3Response.action.matched_indices || [];

          let matchedProducts: any[] = [];

          // 1. Try matched_ids (string IDs)
          if (matchedIds.length > 0) {
            matchedProducts = matchedIds
              .map(id => {
                const found = productById.get(String(id));

                return found;
              })
              .filter(Boolean);
          }

          // 2. Try matched_indices as SKU IDs (convert numbers to strings, look up in map)
          if (matchedProducts.length === 0 && matchedIndices.length > 0) {
            const asIds = matchedIndices
              .map(id => productById.get(String(id)))
              .filter(Boolean);
            if (asIds.length > 0) {
              matchedProducts = asIds;
            }
          }

          // 3. Last resort: try matched_indices as 1-based positional indices
          if (matchedProducts.length === 0 && matchedIndices.length > 0) {
            const asPositions = matchedIndices
              .filter((i: number) => i >= 1 && i <= sourcePool.length)
              .map((i: number) => sourcePool[i - 1])
              .filter(Boolean);
            if (asPositions.length > 0) {
              matchedProducts = asPositions;
            }
          }

          switch (type) {
            case 'filter_apply':
              if (matchedProducts.length > 0) {
                if (key && value) addFilter(key, value);
                setActiveProducts(matchedProducts);
                actualFilteredCount = matchedProducts.length;
              }
              break;

            case 'filter_remove':
              if (key) {
                removeFilter(key);
                setActiveProducts(originalProducts);
                actualFilteredCount = originalProducts.length;
              }
              break;

            case 'filter_clear':
              clearFilters();
              setActiveProducts(originalProducts);
              actualFilteredCount = originalProducts.length;
              break;

            case 'text_search':
              if (value) {
                if (matchedProducts.length > 0) {
                  setActiveProducts(matchedProducts);
                  actualFilteredCount = matchedProducts.length;
                }
                useConversationStore.getState().setPendingCatalogText(value);
              }
              break;

            case 'none':
              break;
          }
        }

        // Use AI's message directly. Only override if AI returned 0 matches for a filter action.
        let finalMessage = p3Response.message?.trim() || '';
        if (
          actualFilteredCount === 0 &&
          (p3Response.action?.type === 'filter_apply' ||
            p3Response.action?.type === 'text_search')
        ) {
          if (!finalMessage) {
            finalMessage = `I couldn't find any matches for "${p3Response.action?.value || 'your query'}" in the current results. You can try narrowing further or search the full catalog.`;
          }
          useConversationStore
            .getState()
            .setPendingCatalogText(p3Response.action?.value || '');
        }
        let finalOptions = p3Response.options || [];

        // Fix count mismatches: AI often says a different number than what was actually resolved.
        // Replace numeric counts in the message with the actual count.
        if (
          actualFilteredCount > 0 &&
          (p3Response.action?.type === 'filter_apply' ||
            p3Response.action?.type === 'text_search')
        ) {
          finalOptions = [
            ...finalOptions,

            {
              label: 'Go back to original results',
              action_type: 'restore_original' as const,
              key: 'restore',
              value: 'restore',
            },
          ];
        }

        const {
          preCatalogResults,
          relatedPartsUsed,
          relatedPartsTableSuggestions,
        } = useConversationStore.getState();

        if (relatedPartsUsed) {
          finalOptions = finalOptions.filter(
            opt => opt.action_type !== 'find_related_parts',
          );
        }
        const catalogSearchReady =
          useConversationStore.getState().catalogSearchReady;

        // If user came from a catalog search, offer to go back to previous results
        if (catalogSearchReady && p3Response.action?.type !== 'filter_clear') {
          finalOptions = [
            ...finalOptions,
            {
              label: 'Text search in catalog',
              action_type: 'catalog_search_text' as const,
              key: 'catalog_search_text',
              value: 'catalog_search_text',
            },
          ];
        }

        if (preCatalogResults && preCatalogResults.length > 0) {
          finalOptions = [
            ...finalOptions,
            {
              label: 'Go back to original results',
              action_type: 'restore_original' as const,
              key: 'restore',
              value: 'restore',
            },
          ];
        }

        if (
          window.settings.vizo?.findRelatedParts &&
          !relatedPartsUsed &&
          relatedPartsTableSuggestions.length > 0
        ) {
          finalOptions = [
            ...finalOptions,
            {
              label: `Find parts related to ${imageAnalysis?.specification?.product_category || 'request image'}`,
              action_type: 'find_related_parts' as const,
              key: 'find_related',
              value: 'find_related_parts',
            },
          ];
        }

        // Add assistant message
        addMessage({
          role: 'assistant',
          content: finalMessage,
          action: p3Response.action,
          options: finalOptions,
        });
      } catch (err: any) {
        console.error('[P3] Error:', err);
        setError(err.message || 'Failed to process message');
        addMessage({
          role: 'assistant',
          content:
            'Oops, something went wrong on my end. Could you try that again?',
        });
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      messages,
      activeFilters,
      filters,
      activeProducts,
      originalProducts,
      fullResultPool,
      imageAnalysis,
      requestImages,
      addMessage,
      addFilter,
      removeFilter,
      clearFilters,
      setActiveProducts,
      setFullResultPool,
      setImageAnalysis,
      setIsLoading,
      setError,
    ],
  );

  return {
    sendMessage,
    messages,
    activeFilters,
  };
}

export default useGoodResultsChat;
