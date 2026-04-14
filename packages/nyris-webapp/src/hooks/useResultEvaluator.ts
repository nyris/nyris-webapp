/**
 * P2 - Result Evaluator
 *
 * Fires once when results are returned from the API.
 * Evaluates whether results match the uploaded image.
 * Routes to P3 (good results) or P5 (bad results recovery).
 */

import { useCallback, useRef } from 'react';
import useConversationStore, {
  FailureMode,
  QuickReplyOption,
  ConversationRoute,
  ResultQuality,
} from 'stores/chat/conversationStore';
import useSmartFiltersStore from 'stores/smartFilters/smartFiltersStore';
import {
  buildP2SystemPrompt,
  buildBrandRegex,
  buildProductTypeRegex,
} from './promptBuilders';

interface P2EvaluationResult {
  quality: ResultQuality;
  failure_mode: FailureMode;
  route: ConversationRoute;
  opening_message: string;
  options: QuickReplyOption[];
}

export function useResultEvaluator() {
  const { isEvaluated, setEvaluationResult, setIsLoading, setError } =
    useConversationStore();
  const { geminiApiKey, geminiModel, filters, orgProfile } =
    useSmartFiltersStore();

  const evaluatingRef = useRef(false);

  const evaluateResults = useCallback(
    async ({
      imageAnalysis,
      activeProducts,
    }: {
      imageAnalysis: any;
      activeProducts: any[];
    }) => {
      const apiKey = geminiApiKey;

      setIsLoading(true);
      setError(null);

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
              // Pattern 3: Known brand prefixes in title (from org profile)
              const brandPatterns = buildBrandRegex(orgProfile);
              if (brandPatterns) {
                const brandMatch = titleDesc.match(brandPatterns);
                if (brandMatch) {
                  metadata.brand = brandMatch[1].toUpperCase();
                }
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
                        orgProfile.p2Prompt || buildP2SystemPrompt(orgProfile),
                    },
                  ],
                },
                {
                  role: 'model',
                  parts: [
                    {
                      text: 'I understand. I will evaluate the results and provide a JSON response.',
                    },
                  ],
                },
                { role: 'user', parts: [{ text: userPrompt }] },
              ],
              generationConfig: {
                temperature: 0.3,
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

        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
          const finishReason = data.candidates?.[0]?.finishReason;
          const blockReason = data.promptFeedback?.blockReason;
          throw new Error(
            `No response from P2 (finish: ${finishReason || 'none'}, block: ${blockReason || 'none'})`,
          );
        }

        // Parse the JSON response
        const evaluation: P2EvaluationResult = JSON.parse(responseText);

        // Store the evaluation result — append "Describe what you're looking for" as last option
        let mappedOptions = evaluation.options.map(opt => ({
          label: opt.label,
          action_type: opt.action_type as
            | 'filter'
            | 'clarify'
            | 'text_search_prompt',
          key: (opt as any).key,
          value: (opt as any).value,
        }));
        mappedOptions.push({
          label: "Describe what you're looking for",
          action_type: 'text_search_prompt',
          key: 'text_search',
          value: 'text_search',
        });

        // Enforce ≤5 rule: if initial results are ≤5, strip filter options, keep only text_search_prompt
        if (activeProducts.length <= 5 && activeProducts.length > 0) {
          console.log(
            `[P2] ≤5 results (${activeProducts.length}) — stripping filter options, keeping only text_search_prompt`,
          );
          mappedOptions = [
            {
              label: "Describe what you're looking for",
              action_type: 'text_search_prompt' as const,
              key: 'text_search',
              value: 'text_search',
            },
          ];
        }

        setEvaluationResult(
          evaluation.quality,
          evaluation.route,
          evaluation.failure_mode,
          evaluation.opening_message,
          mappedOptions,
        );
      } catch (err: any) {
        console.error('[P2] Evaluation error:', err);
        setError(err.message || 'Failed to evaluate results');

        // Fallback to good results on error
        setEvaluationResult(
          'good',
          'P3',
          null,
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
    [
      geminiApiKey,
      setIsLoading,
      setError,
      filters,
      geminiModel,
      orgProfile,
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
