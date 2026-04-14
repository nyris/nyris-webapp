/**
 * P7 - Google Grounding
 *
 * Flow:
 *   1. Send image to Gemini with googleSearch tool → identify product
 *   2. Gemini returns google_input_filters (brand, part_number, model, etc.)
 *   3. Code-based matching against current 100 results (exact, then fuzzy)
 *   4. If not found → call nyris find API with image + text_query
 *   5. Display results in chat
 *
 * text_query = "{brand} {part_number} {category} {material}"
 */

import { useCallback, useRef } from 'react';
import useConversationStore from 'stores/chat/conversationStore';
import useSmartFiltersStore from 'stores/smartFilters/smartFiltersStore';
import useResultStore from 'stores/result/resultStore';
import useRequestStore from 'stores/request/requestStore';
import { find } from 'services/visualSearch';

// ──────────────────────────────────────────────────────────────────
// P7 System Prompt — identification only, NO results matching
// ──────────────────────────────────────────────────────────────────
const P7_SYSTEM_PROMPT = `TASK
You are using Google Search to identify a product from an image.
You do NOT need to match it against any catalog — just identify what the product is.

STEPS
1. Look at the product image carefully.
2. Read ALL text visible on labels, nameplates, packaging, stickers.
3. Use Google Search to identify the exact product.
4. Extract key product details from Google results.
5. Build a text_query for searching a catalog.
6. Return only a valid JSON object. No markdown, no code fences.

EXTRACTION RULES
Extract these fields from the image + Google results:
- product_name: Full product name
- brand: Manufacturer or brand name
- part_number: SKU, part number, or product code (from the LABEL on the product)
- model: Model name or number
- category: Product type/category
- dimensions: Size, measurements
- material: Material composition
- identifiers: Array of any other identifying strings (voltage, current, barcodes)

CRITICAL: Extract part_number and model from the PRODUCT IMAGE LABEL, not from search results.
Only extract values that are clearly stated. Do not infer or guess.

TEXT QUERY CONSTRUCTION
Combine the most important identifiers:
  {brand} {part_number} {category} {material}
Example: "Parker KV-2840-B hydraulic valve brass"
Example: "Delta Electronics EFB0412HHA fan"
Leave out null/empty fields. Always produce a non-empty text_query if google_search_successful is true.

OUTPUT FORMAT (JSON only):
{
  "google_search_successful": true/false,
  "google_input_filters": {
    "product_name": "string or null",
    "brand": "string or null",
    "part_number": "string or null",
    "model": "string or null",
    "category": "string or null",
    "dimensions": "string or null",
    "material": "string or null",
    "identifiers": ["string array"]
  },
  "text_query": "brand part_number category material"
}`;

// ──────────────────────────────────────────────────────────────────
// TypeScript interfaces
// ──────────────────────────────────────────────────────────────────
export interface GoogleInputFilters {
  product_name: string | null;
  brand: string | null;
  part_number: string | null;
  model: string | null;
  category: string | null;
  dimensions: string | null;
  material: string | null;
  identifiers: string[];
}

export interface P7Result {
  google_search_successful: boolean;
  google_input_filters: GoogleInputFilters;
  text_query: string;
}

// Match result from code-based matching
export interface P7MatchResult {
  found: boolean;
  matched_index: number | null;
  match_type: 'exact_sku' | 'exact_part' | 'part_in_title' | 'none';
  match_reason: string;
  matched_product_title: string | null;
}

// ──────────────────────────────────────────────────────────────────
// Helpers for code-based matching
// ──────────────────────────────────────────────────────────────────
function normalize(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // strip all non-alphanumeric
    .trim();
}

/**
 * Programmatic matching: check google_input_filters against current products.
 * STRICT matching — only exact SKU/part_number/model matches count.
 * Brand or category alone is NOT enough.
 *
 * Priority:
 *   1. Exact part_number match against SKU or part_number fields
 *   2. Exact model match against SKU or part_number fields
 *   3. part_number or model found as complete token in product title
 */
function matchInResults(
  gf: GoogleInputFilters,
  products: any[],
): P7MatchResult {
  const noMatch: P7MatchResult = {
    found: false,
    matched_index: null,
    match_type: 'none',
    match_reason: 'No match found in current results',
    matched_product_title: null,
  };
  if (!gf) return noMatch;

  const gPartNorm = normalize(gf.part_number);
  const gModelNorm = normalize(gf.model);

  // Pass 1: Exact part_number match against SKU or part_number fields
  if (gPartNorm) {
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const pSku = normalize(p.sku || p.objectID);
      const pPart = normalize(p.part_number || p.article_number);
      if ((pSku && pSku === gPartNorm) || (pPart && pPart === gPartNorm)) {
        return {
          found: true,
          matched_index: i,
          match_type: 'exact_sku',
          match_reason: `Exact part_number match: "${gf.part_number}" = "${p.sku || p.part_number}"`,
          matched_product_title: p.title || p.name || '',
        };
      }
    }
  }

  // Pass 2: Exact model match against SKU or part_number fields
  if (gModelNorm && gModelNorm !== gPartNorm) {
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const pSku = normalize(p.sku || p.objectID);
      const pPart = normalize(p.part_number || p.article_number);
      if ((pSku && pSku === gModelNorm) || (pPart && pPart === gModelNorm)) {
        return {
          found: true,
          matched_index: i,
          match_type: 'exact_part',
          match_reason: `Exact model match: "${gf.model}" = "${p.sku || p.part_number}"`,
          matched_product_title: p.title || p.name || '',
        };
      }
    }
  }

  // Pass 3: part_number or model found in product title/name (must be a complete token, not substring of another word)
  const searchTerms = [gPartNorm, gModelNorm].filter(Boolean);
  if (searchTerms.length > 0) {
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const titleNorm = normalize(p.title || p.name || '');
      for (const term of searchTerms) {
        // Only match if term is long enough (>=5 chars) and appears in the title
        if (term && term.length >= 5 && titleNorm.includes(term)) {
          return {
            found: true,
            matched_index: i,
            match_type: 'part_in_title',
            match_reason: `Part/model "${term}" found in title: "${(p.title || p.name || '').substring(0, 80)}"`,
            matched_product_title: p.title || p.name || '',
          };
        }
      }
    }
  }

  return noMatch;
}

// ──────────────────────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────────────────────
export function useGoogleGrounding() {
  const { addMessage } = useConversationStore();
  const { geminiApiKey, geminiModel, googleGroundingEnabled } =
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
  const firstSearchResults = useResultStore(state => state.firstSearchResults);
  const setAlgoliaProducts = useResultStore(state => state.setAlgoliaProducts);
  const setFindApiProducts = useResultStore(state => state.setFindApiProducts);

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
  const imageAnalysis = useResultStore(state => state.imageAnalysis);
  const requestImages = useRequestStore(state => state.requestImages);
  const filters = useSmartFiltersStore(state => state.filters);

  const isRunningRef = useRef(false);
  const resultRef = useRef<P7Result | null>(null);

  const getTopScore = useCallback((): number => {
    const results =
      firstSearchResults.length > 0 ? firstSearchResults : activeProducts;
    if (results.length === 0) return 0;
    return results[0]?.score || results[0]?.similarity || 0;
  }, [firstSearchResults, productsFromAlgolia]);

  const shouldActivate = useCallback((): boolean => {
    if (!googleGroundingEnabled) return false;
    if (getTopScore() >= 0.7) return false;
    return true;
  }, [googleGroundingEnabled, getTopScore]);

  // ────────────────────────────────────────────────────────────────
  // Step 1: Call Gemini — identify product from image via Google
  // ────────────────────────────────────────────────────────────────
  const runGrounding = useCallback(async (): Promise<P7Result | null> => {
    if (isRunningRef.current) return resultRef.current;

    const apiKey = geminiApiKey || process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      addMessage({
        role: 'assistant',
        content: '[P7] Error: No Gemini API key configured.',
      });
      return null;
    }

    isRunningRef.current = true;

    try {
      const specification = imageAnalysis?.specification || {};
      const imageDescription = imageAnalysis?.imageDescription || '';

      // Convert request image to base64
      let imageBase64 = '';
      if (requestImages[0]) {
        try {
          const dataUrl = requestImages[0].toDataURL('image/jpeg', 0.8);
          imageBase64 = dataUrl.split(',')[1] || '';
        } catch (e) {
          console.warn('[P7] Could not convert image to base64:', e);
        }
      }

      addMessage({
        role: 'assistant',
        content: `[P7] Searching Google for product identification...\nImage sent: ${imageBase64 ? 'yes' : 'no (text only)'}`,
      });

      // Prompt — no current results, just ask to identify from image
      const userPrompt = `Look at this product image carefully. Read ALL text visible on the product label, nameplate, or packaging.
Then use Google Search to identify this exact product.

IMAGE DESCRIPTION (may be incomplete): ${imageDescription || 'Not available yet'}

SPECIFICATION: ${JSON.stringify(specification, null, 2)}

IMPORTANT: Identify the product from the IMAGE only. Read any text, model numbers, brand names, or part numbers visible on the product.
Then search Google for that specific product. Return JSON only.`;

      const userParts: any[] = [];
      if (imageBase64) {
        userParts.push({
          inlineData: { mimeType: 'image/jpeg', data: imageBase64 },
        });
      }
      userParts.push({ text: userPrompt });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: P7_SYSTEM_PROMPT }] },
              {
                role: 'model',
                parts: [
                  {
                    text: 'Understood. I will look at the image, read visible text, search Google, and return JSON with product details only.',
                  },
                ],
              },
              { role: 'user', parts: userParts },
            ],
            tools: [{ googleSearch: {} }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 1500 },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        addMessage({
          role: 'assistant',
          content: `[P7] HTTP ${response.status}: ${errorText.substring(0, 300)}`,
        });
        return null;
      }

      const data = await response.json();
      console.log(
        '[P7] Raw response:',
        JSON.stringify(data).substring(0, 1000),
      );

      if (data.error) {
        addMessage({
          role: 'assistant',
          content: `[P7] Gemini error: ${data.error.message || JSON.stringify(data.error).substring(0, 300)}`,
        });
        return null;
      }

      if (data.candidates?.[0]?.finishReason === 'SAFETY') {
        addMessage({
          role: 'assistant',
          content: '[P7] Blocked by safety filters.',
        });
        return null;
      }

      const parts = data.candidates?.[0]?.content?.parts || [];
      const allText = parts
        .filter((p: any) => p.text)
        .map((p: any) => p.text)
        .join('\n');
      const gm = data.candidates?.[0]?.groundingMetadata;
      const groundingQueries = gm?.webSearchQueries?.join(', ') || 'none';
      console.log('[P7] Grounding queries:', groundingQueries);

      if (!allText) {
        const partTypes = parts
          .map((p: any) => Object.keys(p).join('+'))
          .join(', ');
        addMessage({
          role: 'assistant',
          content: `[P7] No text in response.\nPart types: [${partTypes}]\nFinish: ${data.candidates?.[0]?.finishReason || '?'}\nGrounding queries: ${groundingQueries}`,
        });
        return null;
      }

      console.log('[P7] Text:', allText.substring(0, 500));

      const jsonMatch = allText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        addMessage({
          role: 'assistant',
          content: `[P7] No JSON found.\nText: ${allText.substring(0, 400)}\nGrounding queries: ${groundingQueries}`,
        });
        return null;
      }

      const p7Result: P7Result = JSON.parse(jsonMatch[0]);
      console.log('[P7] Parsed result:', p7Result);
      resultRef.current = p7Result;
      return p7Result;
    } catch (err: any) {
      console.error('[P7] Error:', err);
      addMessage({
        role: 'assistant',
        content: `[P7] Exception: ${err.message || String(err)}`,
      });
      return null;
    } finally {
      isRunningRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    shouldActivate,
    geminiApiKey,
    imageAnalysis,
    filters,
    firstAlgoliaProducts,
    productsFromAlgolia,
    getTopScore,
    addMessage,
    requestImages,
  ]);

  // ────────────────────────────────────────────────────────────────
  // Step 2-5: Match in results (code-based), then find API if needed
  // ────────────────────────────────────────────────────────────────
  const applyGroundingResult = useCallback(
    async (p7Result: P7Result) => {
      const sourceProducts =
        firstAlgoliaProducts.length > 0 ? firstAlgoliaProducts : activeProducts;
      const gf = p7Result.google_input_filters;

      // ── Show what Google identified ──
      const lines: string[] = [];
      lines.push('[P7 Google Grounding Results]');
      lines.push('');

      if (p7Result.google_search_successful && gf) {
        lines.push('Product identified from image:');
        if (gf.product_name) lines.push(`  Name: ${gf.product_name}`);
        if (gf.brand) lines.push(`  Brand: ${gf.brand}`);
        if (gf.part_number) lines.push(`  Part #: ${gf.part_number}`);
        if (gf.model) lines.push(`  Model: ${gf.model}`);
        if (gf.category) lines.push(`  Category: ${gf.category}`);
        if (gf.dimensions) lines.push(`  Dimensions: ${gf.dimensions}`);
        if (gf.material) lines.push(`  Material: ${gf.material}`);
        if (gf.identifiers?.length)
          lines.push(`  IDs: ${gf.identifiers.join(', ')}`);
        lines.push('');
        lines.push(`Text query: "${p7Result.text_query || 'N/A'}"`);
      } else {
        lines.push('Google could not identify the product.');
        addMessage({ role: 'assistant', content: lines.join('\n') });
        return;
      }

      addMessage({ role: 'assistant', content: lines.join('\n') });

      // ── Step 2: Code-based matching against current results ──
      const match = matchInResults(gf, sourceProducts);
      console.log('[P7] Code-based match:', match);

      const matchLines: string[] = [];
      matchLines.push('[P7 Catalog Match (code-based)]');
      matchLines.push('');
      matchLines.push(`Match found: ${match.found ? 'Yes' : 'No'}`);
      matchLines.push(`Match type: ${match.match_type}`);
      matchLines.push(`Reason: ${match.match_reason}`);
      if (match.matched_product_title)
        matchLines.push(`Product: "${match.matched_product_title}"`);
      addMessage({ role: 'assistant', content: matchLines.join('\n') });

      // ── Step 3: Resurface if found ──
      if (match.found && match.matched_index !== null) {
        const matched = sourceProducts[match.matched_index];
        const reordered = [
          matched,
          ...sourceProducts.filter(
            (_: any, i: number) => i !== match.matched_index,
          ),
        ];
        setActiveProducts(reordered);
      }

      // ── Step 4: Call find API only when no match found in current results ──
      if (!match.found && p7Result.text_query && requestImages[0]) {
        addMessage({
          role: 'assistant',
          content: `[P7] Calling nyris find API...\ntext="${p7Result.text_query}"`,
        });

        try {
          const settings = (window as any).settings;
          const res = await find({
            image: requestImages[0],
            settings,
            text: p7Result.text_query,
          });

          const resultCount = res?.results?.length || 0;
          const topResults = (res?.results || [])
            .slice(0, 5)
            .map(
              (r: any, i: number) =>
                `  ${i + 1}. ${r.sku || 'N/A'} — ${(r.title || r.description || 'Untitled').substring(0, 80)}`,
            );

          const findLines: string[] = [];
          findLines.push('[P7 Find API Results]');
          findLines.push('');
          findLines.push(`Query: image + "${p7Result.text_query}"`);
          findLines.push(`Results: ${resultCount}`);
          if (topResults.length > 0) {
            findLines.push('');
            findLines.push('Top 5:');
            findLines.push(...topResults);
          }
          addMessage({ role: 'assistant', content: findLines.join('\n') });

          if (res?.results && res.results.length > 0) {
            const newSkuFilter = res.results
              .slice()
              .reverse()
              .map((f: any, i: number) => `sku:'${f.sku}'<score=${i}> `)
              .join('OR ');
            useResultStore.getState().setFindApiProducts(res.results);
            useRequestStore
              .getState()
              .setAlgoliaFilter(
                `sku:DOES_NOT_EXIST<score=1> OR ${newSkuFilter}`,
              );
          }
        } catch (err: any) {
          console.error('[P7] Find API error:', err);
          addMessage({
            role: 'assistant',
            content: `[P7] Find API failed: ${err.message}`,
          });
        }
      }

      if (!match.found && !p7Result.text_query) {
        addMessage({
          role: 'assistant',
          content: '[P7] Result not found in catalog.',
        });
      }
    },
    [
      firstAlgoliaProducts,
      activeProducts,
      requestImages,
      setActiveProducts,
      addMessage,
    ],
  );

  return {
    shouldActivate,
    runGrounding,
    applyGroundingResult,
    isRunning: isRunningRef.current,
    result: resultRef.current,
  };
}
