/**
 * P2 - Result Evaluator
 *
 * Fires once when results are returned from the API.
 * Evaluates whether results match the uploaded image.
 * Routes to P3 (good results) or P5 (bad results recovery).
 */

import { useCallback, useRef } from 'react';
import useConversationStore, {
  QuickReplyOption,
  ConversationRoute,
  ResultQuality,
} from 'stores/chat/conversationStore';
import useSmartFiltersStore from 'stores/smartFilters/smartFiltersStore';
import { chatAnalysis } from 'services/vizo';
import useRequestStore from 'stores/request/requestStore';
import { canvasToBase64, cropImage } from 'utils/cropImageToBase64';
import {
  fetchProductImageBase64,
  getProductImageUrl,
} from 'utils/fetchProductImage';
import { loadRelatedPartsTable, lookupRelatedParts } from 'utils/relatedParts';

interface P2EvaluationResult {
  quality: ResultQuality;
  route: ConversationRoute;
  opening_message: string;
  options: QuickReplyOption[];
  keyword?: string;
}

export function useResultEvaluator() {
  const {
    isEvaluated,
    relatedPartsUsed,
    setEvaluationResult,
    setIsLoading,
    setError,
    setRelatedPartsTableSuggestions,
  } = useConversationStore();
  const { filters } = useSmartFiltersStore();

  const evaluatingRef = useRef(false);

  const evaluateResults = useCallback(
    async ({
      imageAnalysis,
      activeProducts,
    }: {
      imageAnalysis: any;
      activeProducts: any[];
    }) => {
      setIsLoading(true);
      setError(null);
      setRelatedPartsTableSuggestions([]);

      try {
        // Build context for P2
        const specification = imageAnalysis?.specification || {};
        const imageDescription =
          imageAnalysis?.imageDescription || 'No description available';

        // Get results (up to 30) with DETAILED metadata for finding differentiating attributes

        const resultsSummary = activeProducts
          .slice(0, 30)
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
              // Pattern 1: First word in all caps (e.g., "MANDRINO*...")
              const capsMatch = title.match(/^([A-Z][A-Z0-9]+)(?:\*|\s)/);
              if (capsMatch) {
                metadata.brand = capsMatch[1];
              }
              // Pattern 2: Text before asterisk (e.g., "MANDRINO*TOOL")
              const asteriskMatch = title.match(/^([^*]+)\*/);
              if (asteriskMatch && asteriskMatch[1].length <= 20) {
                metadata.brand = asteriskMatch[1].trim();
              }
              // Pattern 3: Generic all-caps token in title/description
              const tokenMatch = titleDesc.match(/\b([A-Z][A-Z0-9]{2,})\b/);
              if (tokenMatch) {
                metadata.brand = tokenMatch[1].toUpperCase();
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

            // Extract voltage - multiple patterns for different formats
            // Patterns: "24V DC", "12 V", "DC 24V", "24VDC", "AC 230V"
            const voltagePatterns = [
              /(\d+)\s*V\s*(DC|AC)?/i, // "24V DC", "12 V", "24V"
              /(DC|AC)\s*(\d+)\s*V/i, // "DC 24V", "AC 230V"
              /(\d+)\s*(VDC|VAC)/i, // "24VDC", "230VAC"
            ];
            for (const pattern of voltagePatterns) {
              const voltageMatch = titleDesc.match(pattern);
              if (voltageMatch && !metadata.voltage) {
                // Normalize to format like "24V" or "24V DC"
                const fullMatch = voltageMatch[0]
                  .toUpperCase()
                  .replace(/\s+/g, ' ')
                  .trim();
                // Extract just the number and V
                const numMatch = fullMatch.match(/(\d+)/);
                if (numMatch) {
                  const voltage = numMatch[1];
                  const dcAc = fullMatch.includes('DC')
                    ? ' DC'
                    : fullMatch.includes('AC')
                      ? ' AC'
                      : '';
                  metadata.voltage = `${voltage}V${dcAc}`;
                }
                break;
              }
            }

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
              rank: i + 1,
              title: title || 'Untitled',
              description: (p.description || '').substring(0, 100),
              category: p.category || p.type || 'Unknown',
              score: p.score || p.similarity || 0,
              metadata: Object.keys(metadata).length > 0 ? metadata : null,
            };
          });

        // Build specification from P4 (smart filters)
        const p4Specification: Record<string, string> = {};
        filters.forEach(f => {
          p4Specification[f.label.toLowerCase()] = f.value;
        });

        // Add image analysis specification
        Object.entries(specification).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            p4Specification[key] = value;
          }
        });

        // Analyze common attributes across results for filter suggestions
        const attributeFrequency: Record<string, Record<string, number>> = {};
        resultsSummary.forEach(r => {
          if (r.metadata) {
            Object.entries(r.metadata).forEach(([key, value]) => {
              if (!attributeFrequency[key]) attributeFrequency[key] = {};
              const strValue = String(value);
              attributeFrequency[key][strValue] =
                (attributeFrequency[key][strValue] || 0) + 1;
            });
          }
        });

        const userPrompt = `Evaluate these search results:

IMAGE DESCRIPTION: ${imageDescription}

SPECIFICATION (from image analysis):
${JSON.stringify(p4Specification, null, 2)}

TOP 20 RESULTS WITH METADATA:
${resultsSummary
  .map(
    r =>
      `${r.rank}. ${r.title}${r.description ? ` - ${r.description}` : ''} (Score: ${r.score})${r.metadata ? `\n   Metadata: ${JSON.stringify(r.metadata)}` : ''}`,
  )
  .join('\n')}

COMMON ATTRIBUTES FOUND IN RESULTS (for filter suggestions):
${JSON.stringify(attributeFrequency, null, 2)}

TOTAL RESULTS: ${resultsSummary.length}

Evaluate if these results match the image. If they do (same type of product), route to P3 and suggest filter options based on the COMMON ATTRIBUTES found above (like voltage, size, brand). Do NOT suggest the obvious category match.`;

        const productsForImages = activeProducts.slice(0, 30);
        const imageResults = await Promise.all(
          productsForImages.map(async (p: any, i: number) => {
            const url = getProductImageUrl(p);
            if (!url) return { rank: i + 1, base64: null };

            const base64 = await fetchProductImageBase64(url);

            return { rank: i + 1, base64 };
          }),
        );

        const hasVisualContext =
          imageResults.filter(r => r.base64 !== null).length >= 1;

        const productImageParts: Array<{
          metadata: string;
          image?: string;
          mimeType?: string;
        }> = [];

        resultsSummary.forEach((result, i) => {
          const originalProduct = productsForImages[i];
          const tags = originalProduct?._tags;
          const tagStr = tags
            ? ` | TAGS: type=${tags.productType}, color=${tags.color}, shape=${tags.shape}, material=${tags.material}`
            : '';

          const metaLine = `${result.rank}. ${result.title}${result.description ? ` - ${result.description}` : ''} (Score: ${result.score})${result.metadata ? ` | Metadata: ${JSON.stringify(result.metadata)}` : ''}${tagStr}`;

          if (hasVisualContext && imageResults[i]?.base64) {
            productImageParts.push({
              metadata: metaLine,
              image: imageResults[i].base64 || '',
              mimeType: 'image/jpeg',
            });
          }
        });

        const requestImage = useRequestStore.getState().requestImages;
        const regions = useRequestStore.getState().regions;
        const croppedCanvas = cropImage(requestImage[0], regions[0]);
        const base64Image = canvasToBase64(croppedCanvas, 'image/jpeg', 1);

        const response = await chatAnalysis({
          promptKey: 'result_evaluator_prompt',
          multimodalInputs: [
            {
              metadata: userPrompt,
            },
            {
              metadata: 'request_image',
              mimeType: 'image/jpeg',
              image: base64Image,
            },
            ...productImageParts,
          ],
        });

        const evaluation: P2EvaluationResult = response;

        let mappedOptions = (evaluation?.options || []).map(opt => ({
          label: opt.label,
          action_type: opt.action_type as
            | 'filter'
            | 'clarify'
            | 'text_search_prompt'
            | 'find_related_parts',
          key: (opt as any).key,
          value: (opt as any).value,
        }));
        if (relatedPartsUsed) {
          mappedOptions = mappedOptions.filter(
            opt => opt.action_type !== 'find_related_parts',
          );
        }
        mappedOptions.push({
          label: "Describe what you're looking for",
          action_type: 'text_search_prompt',
          key: 'text_search',
          value: 'text_search',
        });

        // Check lookup table for related parts on fresh image searches and store globally.
        const table = await loadRelatedPartsTable();

        const tableSuggestions = lookupRelatedParts(
          table,
          imageAnalysis?.specification?.product_category || '',
        );
        const hasTableSuggestions =
          !!tableSuggestions && tableSuggestions.length > 0;
        setRelatedPartsTableSuggestions(tableSuggestions || []);

        // GC Gruppe: offer "Find related parts" in initial P2 response
        if (
          window.settings.vizo?.findRelatedParts &&
          hasTableSuggestions &&
          !relatedPartsUsed
        ) {
          mappedOptions.push({
            label: `Find parts related to ${imageAnalysis?.specification?.product_category || 'request image'}`,
            action_type: 'find_related_parts',
            key: 'find_related',
            value: 'find_related_parts',
          });
        }

        // Enforce ≤5 rule: if initial results are ≤5, strip filter options, keep only text_search_prompt
        if (activeProducts.length <= 5 && activeProducts.length > 0) {
          mappedOptions = [
            {
              label: "Describe what you're looking for",
              action_type: 'text_search_prompt' as const,
              key: 'text_search',
              value: 'text_search',
            },
          ];

          if (
            window.settings.vizo?.findRelatedParts &&
            hasTableSuggestions &&
            !relatedPartsUsed
          ) {
            mappedOptions.push({
              label: `Find parts related to ${imageAnalysis?.specification?.product_category || 'request image'}`,
              action_type: 'find_related_parts',
              key: 'find_related',
              value: 'find_related_parts',
            });
          }
        }

        setEvaluationResult(
          evaluation.quality,
          evaluation.route,
          evaluation.opening_message,
          mappedOptions,
          evaluation.keyword,
        );
      } catch (err: any) {
        console.error('result_evaluator_prompt', err);
        setRelatedPartsTableSuggestions([]);
        setError(err.message || 'Failed to evaluate results');

        // Fallback to good results on error
        setEvaluationResult(
          'good',
          'P3',
          "I found some results for your image. How can I help you find what you're looking for?",
          [
            { label: 'Show me options', action_type: 'filter' as const },
            {
              label: "Describe what you're looking for",
              action_type: 'text_search_prompt' as const,
              key: 'text_search',
              value: 'text_search',
            },
          ],
        );
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      setIsLoading,
      setError,
      setRelatedPartsTableSuggestions,
      filters,
      relatedPartsUsed,
      setEvaluationResult,
    ],
  );

  // Reset the guard ref when a new session starts (isEvaluated goes back to false)
  if (!isEvaluated) {
    evaluatingRef.current = false;
  }

  return {
    evaluateResults,
    isEvaluated,
  };
}

export default useResultEvaluator;
