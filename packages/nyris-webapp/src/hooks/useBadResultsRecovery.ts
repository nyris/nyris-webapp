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
import { chatAnalysis } from 'services/vizo';

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

  const { filters } = useSmartFiltersStore();
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
      // Add user message to chat
      addMessage({
        role: 'user',
        content: userMessage,
      });

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
              const tokenMatch = titleDesc.match(/\b([A-Z][A-Z0-9]{2,})\b/);
              if (tokenMatch) metadata.brand = tokenMatch[1].toUpperCase();
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

            // Extract generic product type keywords from title/description
            if (!metadata.product_type) {
              const typeMatch = titleDesc.match(
                /\b(bearing|ring|relay|sensor|motor|fan|contactor|valve|pump|faucet|thermostat|filter|housing)\b/i,
              );
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

        const response = await chatAnalysis({
          promptKey: 'recovery_prompt',
          multimodalInputs: [{ metadata: userPrompt }],
        });

        const responseText = response;

        // Parse the JSON response
        const p5Response: P5Response = responseText;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      messages,
      failureMode,
      attemptCounter,
      filters,
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
