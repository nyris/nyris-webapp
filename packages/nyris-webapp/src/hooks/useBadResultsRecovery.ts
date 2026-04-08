/**
 * P5 - Bad Results Recovery
 *
 * Handles conversation when results don't match the uploaded image.
 * Asks clarifying questions based on failure mode.
 * Digs through all 100 results to resurface better matches.
 * Maximum 3 attempts before suggesting a new image.
 */

import { useCallback } from 'react';
import useConversationStore, {
  QuickReplyOption,
} from 'stores/chat/conversationStore';
import useSmartFiltersStore from 'stores/smartFilters/smartFiltersStore';
import useResultStore from 'stores/result/resultStore';
import {
  buildP5SystemPrompt,
  buildBrandRegex,
  buildProductTypeRegex,
} from './promptBuilders';

// Helper function to normalize text for fuzzy matching
// Handles umlauts (ö→o, ü→u, ä→a, ß→ss) and other diacritics
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ä/g, 'a')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s]/g, ' ') // Replace special chars with space
    .replace(/\s+/g, ' ')
    .trim();
};

// Fuzzy match helper - checks if searchTerm is contained in text with normalization (reserved for future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fuzzyMatch = (text: string, searchTerm: string): boolean => {
  const normalizedText = normalizeText(text);
  const normalizedSearch = normalizeText(searchTerm);

  // Direct containment check
  if (normalizedText.includes(normalizedSearch)) return true;

  // Check individual words from search term
  const searchWords = normalizedSearch.split(' ').filter(w => w.length > 2);
  if (searchWords.length > 1) {
    // All significant words must be present
    return searchWords.every(word => normalizedText.includes(word));
  }

  return false;
};

// P5 System Prompt is now dynamically built via buildP5SystemPrompt(orgProfile)

interface P5Response {
  message: string;
  action: 'ask' | 'resurface' | 'reset' | 'exit';
  filtered_results?: number[];
  options: QuickReplyOption[];
  attempt: number;
}

export function useBadResultsRecovery() {
  const {
    messages,
    failureMode,
    attemptCounter,
    addMessage,
    incrementAttempt,
    setIsLoading,
    setError,
  } = useConversationStore();

  const { geminiApiKey, geminiModel, filters, orgProfile } =
    useSmartFiltersStore();
  const productsFromAlgolia = useResultStore(
    state => state.productsFromAlgolia,
  );
  const productsFromFindApi = useResultStore(
    state => state.productsFromFindApi,
  );
  const firstAlgoliaProducts = useResultStore(
    state => state.firstAlgoliaProducts,
  );
  const setAlgoliaProducts = useResultStore(state => state.setAlgoliaProducts);
  const setFindApiProducts = useResultStore(state => state.setFindApiProducts);
  const imageAnalysis = useResultStore(state => state.imageAnalysis);

  const isAlgoliaEnabled = !!(window as any).settings?.algolia?.enabled;
  const activeProducts = isAlgoliaEnabled
    ? productsFromAlgolia
    : productsFromAlgolia.length > 0
      ? productsFromAlgolia
      : productsFromFindApi;
  const setActiveProducts = isAlgoliaEnabled
    ? setAlgoliaProducts
    : productsFromAlgolia.length > 0
      ? setAlgoliaProducts
      : setFindApiProducts;

  const sendMessage = useCallback(
    async (userMessage: string) => {
      const apiKey = geminiApiKey || process.env.REACT_APP_GEMINI_API_KEY;

      // Add user message to chat
      addMessage({
        role: 'user',
        content: userMessage,
      });

      if (!apiKey) {
        addMessage({
          role: 'assistant',
          content:
            'Please configure your Gemini API key in Admin Settings to use the recovery assistant.',
        });
        return;
      }

      // Check if we've exceeded max attempts
      if (attemptCounter >= 3) {
        addMessage({
          role: 'assistant',
          content:
            "I wasn't able to find a match in the current results. Try uploading a clearer image or from a different angle.",
          action: { type: 'exit' },
        });
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Build context for P5
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

        // Get all 100 results with detailed metadata
        // ALWAYS use firstAlgoliaProducts (original) so indices are consistent
        // This allows "show original results" and filtering from original to work correctly
        const originalProducts =
          firstAlgoliaProducts.length > 0
            ? firstAlgoliaProducts
            : activeProducts;
        const allResults = originalProducts
          .slice(0, 100)
          .map((p: any, i: number) => {
            // Extract all potentially useful metadata
            const metadata: Record<string, any> = {};
            const metadataFields = [
              'voltage',
              'size',
              'brand',
              'manufacturer',
              'material',
              'type',
              'category',
              'color',
              'dimensions',
              'power',
              'current',
              'connector',
              'model',
              'series',
              'product_line',
            ];

            metadataFields.forEach(field => {
              if (p[field]) metadata[field] = p[field];
            });

            // Extract from title/description using common patterns
            const title = p.title || p.name || '';
            const titleDesc = `${title} ${p.description || ''}`;

            // Extract brand from title - often first word(s) in CAPS or before asterisk
            if (!metadata.brand && !metadata.manufacturer) {
              const capsMatch = title.match(/^([A-Z][A-Z0-9]+)(?:\*|\s)/);
              if (capsMatch) metadata.brand = capsMatch[1];
              const asteriskMatch = title.match(/^([^*]+)\*/);
              if (asteriskMatch && asteriskMatch[1].length <= 20)
                metadata.brand = asteriskMatch[1].trim();
              const brandPatterns = buildBrandRegex(orgProfile);
              if (brandPatterns) {
                const brandMatch = titleDesc.match(brandPatterns);
                if (brandMatch) metadata.brand = brandMatch[1].toUpperCase();
              }
            }

            // Extract dimensions like "382 mm x 260 mm x 3 mm" or "344 x 221 x 3"
            const dimensionMatch = titleDesc.match(
              /(\d+)\s*(?:mm)?\s*[xX×]\s*(\d+)\s*(?:mm)?\s*(?:[xX×]\s*(\d+))?/i,
            );
            if (dimensionMatch && !metadata.dimensions) {
              const dims = dimensionMatch[3]
                ? `${dimensionMatch[1]}x${dimensionMatch[2]}x${dimensionMatch[3]}mm`
                : `${dimensionMatch[1]}x${dimensionMatch[2]}mm`;
              metadata.dimensions = dims;
            }

            // Extract voltage
            const voltageMatch = titleDesc.match(/(\d+)\s*V\s*(DC|AC)?/i);
            if (voltageMatch && !metadata.voltage)
              metadata.voltage = voltageMatch[0];

            // Extract product type from title (from org profile regex terms)
            const typeRegex = buildProductTypeRegex(orgProfile);
            if (typeRegex && !metadata.product_type) {
              const typeMatch = titleDesc.match(typeRegex);
              if (typeMatch) {
                metadata.product_type = typeMatch[1].toUpperCase();
              }
            }

            // Extract material
            const materialMatch = titleDesc.match(
              /\b(steel|aluminum|aluminium|brass|copper|plastic|rubber|stainless)\b/i,
            );
            if (materialMatch && !metadata.material)
              metadata.material = materialMatch[1].toLowerCase();

            return {
              index: i,
              sku: p.sku || p.objectID || `product-${i}`,
              title: title || 'Untitled',
              description: (p.description || '').substring(0, 100),
              category: p.category || p.type || '',
              metadata: Object.keys(metadata).length > 0 ? metadata : null,
            };
          });

        // Analyze common attributes across results for smart question options
        const attributeFrequency: Record<string, Record<string, number>> = {};
        allResults.forEach((r: any) => {
          if (r.metadata) {
            Object.entries(r.metadata).forEach(([key, value]) => {
              if (!attributeFrequency[key]) attributeFrequency[key] = {};
              const strValue = String(value);
              attributeFrequency[key][strValue] =
                (attributeFrequency[key][strValue] || 0) + 1;
            });
          }
        });

        // Build conversation history
        const conversationHistory = messages.map(m => ({
          role: m.role,
          content: m.content,
        }));

        const userPrompt = `CONTEXT:

IMAGE DESCRIPTION: ${imageDescription}

SPECIFICATION (from image analysis):
${JSON.stringify(p4Specification, null, 2)}

FAILURE MODE: ${failureMode || 'unknown'}

COMMON ATTRIBUTES FOUND IN RESULTS (use these for question options - ask about varied attributes, NOT the obvious category):
${JSON.stringify(attributeFrequency, null, 2)}

CURRENT ATTEMPT: ${attemptCounter} of 3

ALL RESULTS (100 max, for scanning - includes extracted metadata):
${allResults.map((r: (typeof allResults)[number]) => `[${r.index}] ${r.sku} | ${r.title}${r.metadata ? ` | ${JSON.stringify(r.metadata)}` : ''}`).join('\n')}

CONVERSATION HISTORY:
${conversationHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

USER MESSAGE: ${userMessage}

Based on the user's answer and the failure mode strategy, decide whether to ask another question, resurface better matches, or exit.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text:
                        orgProfile.p5Prompt || buildP5SystemPrompt(orgProfile),
                    },
                  ],
                },
                {
                  role: 'model',
                  parts: [
                    {
                      text: 'I understand. I will help recover from poor search results by asking clarifying questions and resurfacing better matches.',
                    },
                  ],
                },
                { role: 'user', parts: [{ text: userPrompt }] },
              ],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 8192,
                responseMimeType: 'application/json',
              },
            }),
          },
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.error?.message || `Gemini API error: ${response.status}`,
          );
        }

        const data = await response.json();
        console.log(
          '[P5] Gemini response:',
          JSON.stringify(data).substring(0, 500),
        );
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
          const finishReason = data.candidates?.[0]?.finishReason;
          const blockReason = data.promptFeedback?.blockReason;
          throw new Error(
            `No response from P5 (finish: ${finishReason || 'none'}, block: ${blockReason || 'none'})`,
          );
        }

        // Parse the JSON response
        const p5Response: P5Response = JSON.parse(responseText);

        console.log('[P5] Response:', p5Response);

        // Execute the action
        // ALWAYS use firstAlgoliaProducts for index lookup (matches what we sent to LLM)
        const sourceProducts =
          firstAlgoliaProducts.length > 0
            ? firstAlgoliaProducts
            : activeProducts;

        switch (p5Response.action) {
          case 'resurface':
            // FILTER products to only show matching ones (not just reorder)
            if (
              p5Response.filtered_results &&
              p5Response.filtered_results.length > 0
            ) {
              const indices = p5Response.filtered_results;
              const filteredProducts: any[] = [];
              const usedIndices = new Set<number>();

              // Only add products that match the filter criteria
              for (const idx of indices) {
                if (
                  idx >= 0 &&
                  idx < sourceProducts.length &&
                  !usedIndices.has(idx)
                ) {
                  filteredProducts.push(sourceProducts[idx]);
                  usedIndices.add(idx);
                }
              }

              // Only show filtered products, not all products
              if (filteredProducts.length > 0) {
                setActiveProducts(filteredProducts);
              }
            }
            break;
          case 'ask':
            incrementAttempt();
            break;
          case 'reset':
            if (firstAlgoliaProducts.length > 0) {
              setActiveProducts(firstAlgoliaProducts);
            }
            break;
          case 'exit':
            // No action needed, just show exit message
            break;
        }

        // Add assistant message
        addMessage({
          role: 'assistant',
          content: p5Response.message,
          action: { type: p5Response.action },
          options: p5Response.options,
        });
      } catch (err: any) {
        console.error('[P5] Error:', err);
        setError(err.message || 'Failed to process message');
        addMessage({
          role: 'assistant',
          content:
            'Oops, something went wrong on my end. Would you like to try with a different image?',
          options: [{ label: 'Upload new image', action_type: 'clarify' }],
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      messages,
      failureMode,
      attemptCounter,
      geminiApiKey,
      filters,
      orgProfile,
      activeProducts,
      firstAlgoliaProducts,
      imageAnalysis,
      addMessage,
      incrementAttempt,
      setActiveProducts,
      setIsLoading,
      setError,
    ],
  );

  return {
    sendMessage,
    messages,
    failureMode,
    attemptCounter,
  };
}

export default useBadResultsRecovery;
