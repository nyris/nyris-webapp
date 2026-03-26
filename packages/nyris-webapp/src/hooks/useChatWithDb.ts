/**
 * P6 - Chat with DB
 *
 * Extracts filter values from user's product description text (e.g. IDs, product names,
 * specifications) and queries MongoDB or another data source to find matching products.
 *
 * Trigger: User message with 5+ words that looks like a product description.
 * Output: Extracted filters → query full index / DB → display results.
 */

import { useCallback } from 'react';
import useConversationStore from 'stores/chat/conversationStore';
import useSmartFiltersStore from 'stores/smartFilters/smartFiltersStore';
import useResultStore from 'stores/result/resultStore';

// P6 System Prompt - extract structured filters from product description
const P6_SYSTEM_PROMPT = `ROLE
You are the Filter Extractor for "Chat with DB" - a catalog search assistant. The user provides a text description that may include product IDs, names, part numbers, or specifications. Your job is to extract structured filter values to search the catalog.

TRIGGER
- Input is 5+ words and resembles a product description (IDs, part numbers, specs, product names).
- Extract: SKU, part number, brand, type/category, dimensions, voltage, material, model, or any identifiable attribute.

YOUR TASK
1. Parse the user's text for catalog-searchable attributes.
2. Extract one or multiple filter values. Each filter has: key (attribute name) and value.
3. Normalize values: trim spaces, standardize units (e.g. "24V" not "24 volts").
4. Prioritize: SKU/part_number > brand > type > dimensions > voltage > material.

ATTRIBUTE MAPPING (use these keys for catalog fields):
- sku, part_number, article_number → product identifier
- brand, manufacturer → brand
- type, category, product_type → product type
- dimensions, size, voltage, material, color, model → spec attributes

OUTPUT FORMAT (JSON only, no markdown):
{
  "is_product_description": true | false,
  "message": "string (brief confirmation of what was extracted)",
  "filters": [
    { "key": "string (catalog field name)", "value": "string (extracted value)" }
  ],
  "search_query": "string (optional: free-text query for full-text search, e.g. concatenated key terms)"
}

If the input does NOT look like a product description (e.g. "show me rings" or "what is this?"), set is_product_description: false and filters: [].`;

export interface P6ExtractionResult {
  is_product_description: boolean;
  message: string;
  filters: Array< { key: string; value: string }>;
  search_query?: string;
}

/** Heuristic: message looks like a pasted product description/spec sheet, not a conversational request.
 *  "Schneider Electric ZBV-B6 24V LED indicator light block" → true (spec/description)
 *  "I need to look for a 100v connector" → false (conversational request → P3)
 */
export function looksLikeProductDescription(message: string): boolean {
  const trimmed = message.trim();
  if (trimmed.length < 20) return false;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 5) return false;

  // Exclude conversational questions
  const isQuestion = /^(what|how|why|which|where|when|who|can|do|does|is|are|show|tell|compare|find)\b/i.test(trimmed)
    || trimmed.includes('?');
  if (isQuestion) return false;

  // Exclude conversational requests — these should go to P3 for filtering
  const isRequest = /^(i\s+(need|want|am looking|would like)|looking\s+for|find\s+me|show\s+me|get\s+me|search\s+for|give\s+me|help\s+me|filter|narrow|sort|only\s+show|remove|exclude)\b/i.test(trimmed);
  if (isRequest) return false;

  // Require multiple spec-like patterns or a part number format to qualify as a product description
  const specPatterns = [
    /\d+\s*(mm|cm|m|V|volt|A|amp|W|watt|Hz|inch|kg|lb|°C|°F|ohm|Ω)/i,
    /\b(sku|art\.|part\s*#|no\.|nr\.|p\/n|ref\.|item\s*#)\b/i,
    /\b[A-Z]{2,}[-\s]?\d{2,}/,  // Part number patterns like "ZBV-B6", "AB 1234"
    /\d+\s*[x×]\s*\d+/,         // Dimensions like "50x30"
  ];
  const matchCount = specPatterns.filter(p => p.test(trimmed)).length;
  return matchCount >= 2 || /\b(sku|art\.|part\s*#|p\/n)\b/i.test(trimmed);
}

/** Query the Chat with DB backend - configurable URL for MongoDB or other */
async function queryChatWithDb(
  filters: Array<{ key: string; value: string }>,
  searchQuery?: string,
  apiUrl?: string
): Promise<any[]> {
  const url = apiUrl || (window as any).settings?.chatWithDb?.apiUrl;
  if (url) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filters, searchQuery }),
    });
    if (!res.ok) throw new Error(`Chat with DB API error: ${res.status}`);
    const data = await res.json();
    return data.results || data.hits || data.products || [];
  }
  // Fallback: no backend yet - return empty. Frontend can use Algolia as fallback.
  return [];
}

export function useChatWithDb() {
  const { addMessage, setIsLoading, setError } = useConversationStore();
  const { geminiApiKey, geminiModel, chatWithDbApiUrl } = useSmartFiltersStore();
  const setFindApiProducts = useResultStore(state => state.setFindApiProducts);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      const apiKey = geminiApiKey || (window as any).settings?.smartFilters?.geminiApiKey;

      addMessage({ role: 'user', content: userMessage });

      if (!apiKey) {
        addMessage({
          role: 'assistant',
          content: 'Please configure your Gemini API key in Admin Settings to use Chat with DB.',
        });
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                { role: 'user', parts: [{ text: P6_SYSTEM_PROMPT }] },
                {
                  role: 'model',
                  parts: [
                    {
                      text:
                        'I will extract catalog filters from product descriptions. Output JSON only.',
                    },
                  ],
                },
                { role: 'user', parts: [{ text: `USER MESSAGE: ${userMessage}` }] },
              ],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 500,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
          throw new Error('No response from P6');
        }

        const p6Result: P6ExtractionResult = JSON.parse(responseText);
        console.log('[P6] Extraction result:', p6Result);

        if (!p6Result.is_product_description || !p6Result.filters?.length) {
          addMessage({
            role: 'assistant',
            content:
              p6Result.message ||
              "I couldn't extract product details from that. Try describing the part with an ID, name, or specs (e.g. 'SKU ABC123, 24V fan 50mm').",
          });
          return;
        }

        // Try Chat with DB backend (MongoDB etc.)
        const dbResults = await queryChatWithDb(
          p6Result.filters,
          p6Result.search_query,
          chatWithDbApiUrl || undefined
        );

        if (dbResults.length > 0) {
          setFindApiProducts(dbResults);
          addMessage({
            role: 'assistant',
            content: `Found ${dbResults.length} result(s) for: ${p6Result.filters.map((f) => `${f.key}=${f.value}`).join(', ')}.`,
          });
          return;
        }

        // Fallback: use nyris Find API text search
        const searchTerms = p6Result.search_query || p6Result.filters.map((f) => f.value).join(' ');
        const filterSummary = p6Result.filters.map((f) => `${f.key}=${f.value}`).join(', ');
        let catalogResultCount = 0;
        try {
          const settings = (window as any).settings;
          const apiKey = settings?.apiKey || settings?.nyrisApiKey;
          const baseUrl = settings?.baseUrl || 'https://api.nyris.io';
          const formData = new FormData();
          formData.append('text', searchTerms);
          const textSearchRes = await fetch(`${baseUrl}/find/v1.1`, {
            method: 'POST',
            headers: {
              'X-Api-Key': apiKey,
              'Accept': 'application/offers.complete+json',
              'X-Options': 'limit=50',
            },
            body: formData,
          });
          const textSearchData = await textSearchRes.json();
          const allResults = textSearchData?.results || [];
          catalogResultCount = allResults.length;
          if (allResults.length > 0) {
            setFindApiProducts(allResults.slice(0, 20));
          }
        } catch (fetchErr) {
          console.error('[P6] Text search fallback failed:', fetchErr);
        }

        if (catalogResultCount > 0) {
          addMessage({
            role: 'assistant',
            content: `I searched the catalog for ${filterSummary} and found ${catalogResultCount} result${catalogResultCount === 1 ? '' : 's'}. I've updated your results.`,
          });
        } else {
          addMessage({
            role: 'assistant',
            content: `I searched the catalog for ${filterSummary} but couldn't find any matching products. Try adjusting your description or search with an image instead.`,
          });
        }
      } catch (err: any) {
        console.error('[P6] Error:', err);
        setError(err.message || 'Chat with DB failed');
        addMessage({
          role: 'assistant',
          content:
            'Sorry, I could not search the catalog. Please try again or describe the product differently.',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      geminiApiKey,
      chatWithDbApiUrl,
      addMessage,
      setIsLoading,
      setError,
      setFindApiProducts,
    ]
  );

  return { sendMessage };
}
