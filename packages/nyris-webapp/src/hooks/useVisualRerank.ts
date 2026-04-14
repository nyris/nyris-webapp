/**
 * Visual Reranking
 *
 * After final results appear, sends the request image alongside each result
 * image + metadata to Gemini 2.5 Flash Lite for a 1:1 visual comparison.
 * Gemini scores each result on how well it matches the request image,
 * then results are reordered by that score.
 *
 * Reuses the image-fetching pattern from useSmartFilters.
 */

import { useCallback, useRef } from 'react';
import useSmartFiltersStore from 'stores/smartFilters/smartFiltersStore';
import useResultStore from 'stores/result/resultStore';
import useRequestStore from 'stores/request/requestStore';

const VISUAL_RERANK_PROMPT = `You are a visual product matching expert. You are given:
1. A REQUEST IMAGE — the product the user is searching for.
2. A list of CANDIDATE products, each with an image and metadata.

YOUR TASK:
Compare each candidate product visually against the request image.
Score each candidate from 0 to 100 based on how closely it matches:
- 90-100: Same product or nearly identical
- 70-89: Same type/category, very similar appearance
- 50-69: Related product, some visual similarities
- 30-49: Same broad category but different product
- 0-29: Completely different product

SCORING CRITERIA (in order of importance):
1. Visual similarity — shape, form factor, size
2. Product type — same kind of product
3. Brand/model match — same manufacturer
4. Color/material match
5. Details — connectors, labels, markings
6. API Score — the original search engine similarity score (0-1, higher = more similar). Use as a tiebreaker when visual similarity is close.

RULES:
- Score based on the IMAGES, not just metadata.
- Be strict: only score 80+ if it really looks like the same product.
- Return ALL candidates, sorted by score descending.

OUTPUT FORMAT (JSON only, no markdown):
{
  "results": [
    {
      "sku": "string",
      "score": number (0-100),
      "reasoning": "one sentence explaining the score"
    }
  ]
}`;

interface VisualRerankResult {
  sku: string;
  score: number;
  reasoning: string;
}

/** Convert canvas/URL to base64 (reused pattern from useSmartFilters) */
async function toBase64(source: HTMLCanvasElement | string): Promise<string> {
  if (source instanceof HTMLCanvasElement) {
    const maxSize = 512;
    let canvas = source;
    if (canvas.width > maxSize || canvas.height > maxSize) {
      const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height);
      const offscreen = document.createElement('canvas');
      offscreen.width = Math.round(canvas.width * scale);
      offscreen.height = Math.round(canvas.height * scale);
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.drawImage(canvas, 0, 0, offscreen.width, offscreen.height);
        canvas = offscreen;
      }
    }
    return canvas.toDataURL('image/jpeg', 0.7).split(',')[1] || '';
  }

  // URL string — fetch and convert
  const res = await fetch(source);
  const blob = await res.blob();

  return new Promise((resolve, reject) => {
    // Resize via canvas
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxSize = 384;
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No 2d context'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const b64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1] || '';
      resolve(b64);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(blob);
  });
}

export function useVisualRerank() {
  const {
    geminiApiKey,
    geminiModel,
    visualRerankEnabled,
    setIsVisualReranking,
    setIsVisualReranked,
    setVisualRerankRankings,
  } = useSmartFiltersStore();
  const productsFromAlgolia = useResultStore(
    state => state.productsFromAlgolia,
  );
  const setAlgoliaProducts = useResultStore(state => state.setAlgoliaProducts);
  const requestImages = useRequestStore(state => state.requestImages);

  const isRunningRef = useRef(false);

  const runVisualRerank = useCallback(async () => {
    if (!visualRerankEnabled) {
      console.log('[VisualRerank] Disabled');
      return;
    }
    if (isRunningRef.current) {
      console.log('[VisualRerank] Already running');
      return;
    }

    const apiKey = geminiApiKey || process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      console.log('[VisualRerank] No API key');
      return;
    }
    if (!requestImages[0] || productsFromAlgolia.length === 0) {
      console.log('[VisualRerank] No image or no results');
      return;
    }

    isRunningRef.current = true;
    setIsVisualReranking(true);
    console.log('[VisualRerank] Starting visual reranking...');
    const startTime = Date.now();

    try {
      const resultsToRerank = productsFromAlgolia.slice(0, 20);

      // Fetch all images in parallel
      const [requestImageB64, ...candidateImages] = await Promise.all([
        toBase64(requestImages[0]),
        ...resultsToRerank.map(async (result: any) => {
          const imageUrl =
            result.matches?.[0]?.url ||
            result.main_image_link ||
            result.image ||
            result.images?.[0];
          if (!imageUrl)
            return { sku: result.sku || result.objectID, base64: null };
          try {
            const b64 = await toBase64(imageUrl);
            return { sku: result.sku || result.objectID, base64: b64 };
          } catch {
            return { sku: result.sku || result.objectID, base64: null };
          }
        }),
      ]);

      console.log(
        `[VisualRerank] Images fetched in ${Date.now() - startTime}ms`,
      );

      // Build multimodal parts
      const parts: any[] = [
        { text: 'REQUEST IMAGE (the product the user is searching for):' },
        { inline_data: { mime_type: 'image/jpeg', data: requestImageB64 } },
        { text: '\n\nCANDIDATE PRODUCTS:\n' },
      ];

      resultsToRerank.forEach((result: any, i: number) => {
        const sku = result.sku || result.objectID;
        const score = result.score ?? result.similarity ?? null;
        const meta = [
          `\n--- Candidate ${i + 1} ---`,
          `SKU: ${sku}`,
          `Title: ${result.title || result.name || sku}`,
        ];
        if (score !== null) meta.push(`API Score: ${Number(score).toFixed(3)}`);
        if (result.brand) meta.push(`Brand: ${result.brand}`);
        if (result.description)
          meta.push(
            `Description: ${(result.description || '').substring(0, 120)}`,
          );
        if (result.category || result.type)
          meta.push(`Category: ${result.category || result.type}`);
        if (result.material) meta.push(`Material: ${result.material}`);

        parts.push({ text: meta.join('\n') + '\n' });

        const imgData = candidateImages[i];
        if (imgData?.base64) {
          parts.push({
            inline_data: { mime_type: 'image/jpeg', data: imgData.base64 },
          });
        } else {
          parts.push({ text: '[Image not available]' });
        }
      });

      parts.push({ text: `\n\n${VISUAL_RERANK_PROMPT}` });

      // Call Gemini 2.5 Flash Lite
      const geminiStart = Date.now();
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
          }),
        },
      );

      console.log(
        `[VisualRerank] Gemini responded in ${Date.now() - geminiStart}ms`,
      );

      if (!response.ok) {
        const errData = await response.json();
        console.error('[VisualRerank] API error:', errData.error?.message);
        return;
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) {
        console.error('[VisualRerank] No response text');
        return;
      }

      // Parse JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('[VisualRerank] No JSON in response');
        return;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const rankedResults: VisualRerankResult[] = parsed.results || [];
      console.log(`[VisualRerank] Got ${rankedResults.length} scored results`);

      // Build SKU → score + reasoning map
      const scoreMap = new Map<string, { score: number; reasoning: string }>();
      rankedResults.forEach(r =>
        scoreMap.set(String(r.sku).trim(), {
          score: r.score,
          reasoning: r.reasoning,
        }),
      );

      // Record original rankings (1-based) before reordering
      const originalRankMap: Record<string, number> = {};
      productsFromAlgolia.slice(0, 20).forEach((p, i) => {
        const sku = String(p.sku || p.objectID).trim();
        originalRankMap[sku] = i + 1;
      });

      // Reorder productsFromAlgolia based on scores
      const top20 = productsFromAlgolia.slice(0, 20);
      const rest = productsFromAlgolia.slice(20);

      const reordered = [...top20].sort((a, b) => {
        const skuA = String(a.sku || a.objectID).trim();
        const skuB = String(b.sku || b.objectID).trim();
        const scoreA = scoreMap.get(skuA)?.score ?? 0;
        const scoreB = scoreMap.get(skuB)?.score ?? 0;
        return scoreB - scoreA;
      });

      // Build rank change map: SKU → { originalRank, newRank, score, reasoning }
      const rankingsMap: Record<
        string,
        {
          originalRank: number;
          newRank: number;
          score: number;
          reasoning: string;
        }
      > = {};
      reordered.forEach((p, i) => {
        const sku = String(p.sku || p.objectID).trim();
        const orig = originalRankMap[sku] ?? i + 1;
        const info = scoreMap.get(sku);
        rankingsMap[sku] = {
          originalRank: orig,
          newRank: i + 1,
          score: info?.score ?? 0,
          reasoning: info?.reasoning ?? '',
        };
      });

      setAlgoliaProducts([...reordered, ...rest]);
      setVisualRerankRankings(rankingsMap);
      setIsVisualReranked(true);
      console.log(
        `[VisualRerank] Results reranked in ${Date.now() - startTime}ms total`,
      );

      // Log top 5 for debugging
      reordered.slice(0, 5).forEach((p, i) => {
        const sku = String(p.sku || p.objectID).trim();
        const info = rankingsMap[sku];
        const change = info ? info.originalRank - info.newRank : 0;
        const arrow =
          change > 0 ? `↑${change}` : change < 0 ? `↓${Math.abs(change)}` : '—';
        console.log(
          `  ${i + 1}. [${info?.score ?? '?'}] ${sku} ${arrow} — ${info?.reasoning || ''}`,
        );
      });
    } catch (err: any) {
      console.error('[VisualRerank] Error:', err);
    } finally {
      isRunningRef.current = false;
      setIsVisualReranking(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    geminiApiKey,
    visualRerankEnabled,
    productsFromAlgolia,
    requestImages,
    setAlgoliaProducts,
    setIsVisualReranking,
    setIsVisualReranked,
    setVisualRerankRankings,
  ]);

  return {
    runVisualRerank,
    isEnabled: visualRerankEnabled,
  };
}
