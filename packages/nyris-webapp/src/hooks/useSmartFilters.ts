import { useCallback, useRef, useEffect } from 'react';
import useSmartFiltersStore, { SmartFilter, RerankedResult } from 'stores/smartFilters/smartFiltersStore';
import useRequestStore from 'stores/request/requestStore';
import useResultStore from 'stores/result/resultStore';

const getGeminiApiUrl = (model: string) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

// Image cache for pre-fetched matched images (stores compressed base64)
const imageCache = new Map<string, string>();

// Compress and resize image for Gemini (reduces payload significantly)
const compressImageFromUrl = (url: string, maxSize = 512, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Calculate new dimensions (maintain aspect ratio, max 512px)
        let width = img.width;
        let height = img.height;
        
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height / width) * maxSize);
            width = maxSize;
          } else {
            width = Math.round((width / height) * maxSize);
            height = maxSize;
          }
        }
        
        // Draw to canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl.split(',')[1]);
      } catch (err) {
        reject(err);
      }
    };
    
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

export function useSmartFilters() {
  const {
    geminiApiKey,
    geminiModel,
    filterPrompt,
    rerankPrompt,
    includeReasoning,
    filters,
    selectedFilters,
    originalRankings,
    setFilters,
    setIsGeneratingFilters,
    setIsReranking,
    setRerankedResults,
    setOriginalRankings,
    setIsReranked,
    setError,
    clearSelectedFilters,
  } = useSmartFiltersStore();

  const requestImages = useRequestStore(state => state.requestImages);
  const productsFromAlgolia = useResultStore(state => state.productsFromAlgolia);
  const productsFromFindApi = useResultStore(state => state.productsFromFindApi);
  
  const isAlgoliaEnabled = !!(window as any).settings?.algolia?.enabled;
  const activeProducts = isAlgoliaEnabled ? productsFromAlgolia : (productsFromAlgolia.length > 0 ? productsFromAlgolia : productsFromFindApi);
  
  // Track if we've started pre-fetching for current results
  const prefetchedForRef = useRef<string>('');

  // Convert image to base64 - supports HTMLCanvasElement, string URL, File, or Blob
  // URL images are automatically compressed and resized for optimal Gemini performance
  const imageToBase64 = useCallback(async (imageSource: HTMLCanvasElement | string | File | Blob): Promise<string> => {
    // Handle HTMLCanvasElement (request image from user)
    if (imageSource instanceof HTMLCanvasElement) {
      // Resize if too large
      const maxSize = 768; // Slightly larger for request image
      let canvas = imageSource;
      
      if (imageSource.width > maxSize || imageSource.height > maxSize) {
        const scale = Math.min(maxSize / imageSource.width, maxSize / imageSource.height);
        const newCanvas = document.createElement('canvas');
        newCanvas.width = Math.round(imageSource.width * scale);
        newCanvas.height = Math.round(imageSource.height * scale);
        const ctx = newCanvas.getContext('2d');
        ctx?.drawImage(imageSource, 0, 0, newCanvas.width, newCanvas.height);
        canvas = newCanvas;
      }
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      return dataUrl.split(',')[1];
    }
    
    if (typeof imageSource === 'string') {
      // Check cache first (already compressed)
      if (imageCache.has(imageSource)) {
        return imageCache.get(imageSource)!;
      }
      
      // It's a URL or data URL
      if (imageSource.startsWith('data:')) {
        return imageSource.split(',')[1];
      }
      
      // Fetch and compress the image
      try {
        const compressedBase64 = await compressImageFromUrl(imageSource, 512, 0.7);
        imageCache.set(imageSource, compressedBase64);
        return compressedBase64;
      } catch (err) {
        // Fallback: fetch without compression
        console.warn('[SmartFilters] Compression failed, using original:', err);
        const response = await fetch(imageSource);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            imageCache.set(imageSource, base64);
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    } else {
      // It's a File or Blob - compress it too
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const maxSize = 512;
            let width = img.width;
            let height = img.height;
            
            if (width > maxSize || height > maxSize) {
              if (width > height) {
                height = Math.round((height / width) * maxSize);
                width = maxSize;
              } else {
                width = Math.round((width / height) * maxSize);
                height = maxSize;
              }
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
          };
          img.onerror = reject;
          img.src = reader.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageSource);
      });
    }
  }, []);

  // Pre-fetch all matched images in parallel when results come in (with compression)
  const prefetchMatchedImages = useCallback(async (products: any[]) => {
    const imageUrls: string[] = [];
    
    products.slice(0, 20).forEach((product: any) => {
      const matchedImageUrl = product.matches?.[0]?.url;
      const fallbackImageUrl = product.main_image_link || product.image || product.images?.[0];
      const imageUrl = matchedImageUrl || fallbackImageUrl;
      
      if (imageUrl && !imageCache.has(imageUrl)) {
        imageUrls.push(imageUrl);
      }
    });

    if (imageUrls.length === 0) return;

    console.log(`[SmartFilters] Pre-fetching & compressing ${imageUrls.length} images...`);
    const startTime = Date.now();
    
    // Fetch, compress, and cache all images in parallel
    await Promise.allSettled(
      imageUrls.map(async (url) => {
        try {
          const compressedBase64 = await compressImageFromUrl(url, 512, 0.7);
          imageCache.set(url, compressedBase64);
        } catch (err) {
          console.warn(`[SmartFilters] Failed to pre-fetch: ${url}`);
        }
      })
    );
    
    console.log(`[SmartFilters] Pre-fetch complete in ${Date.now() - startTime}ms. Cache size: ${imageCache.size}`);
  }, []);

  useEffect(() => {
    if (activeProducts.length > 0) {
      const cacheKey = activeProducts.slice(0, 5).map((p: any) => p.sku || p.objectID).join(',');
      if (prefetchedForRef.current !== cacheKey) {
        prefetchedForRef.current = cacheKey;
        prefetchMatchedImages(activeProducts);
      }
    }
  }, [activeProducts, prefetchMatchedImages]);

  // Generate AI filters from the uploaded image
  const generateFilters = useCallback(async () => {
    if (!geminiApiKey) {
      setError('Please configure your Gemini API key in Admin Settings');
      return;
    }

    if (!requestImages[0]) {
      setError('No image available for filter generation');
      return;
    }

    setIsGeneratingFilters(true);
    setError(null);

    try {
      const imageBase64 = await imageToBase64(requestImages[0]);

      const response = await fetch(`${getGeminiApiUrl(geminiModel || 'gemini-2.5-flash-lite')}?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: filterPrompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
            ],
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024, // Reduced for faster response
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Failed to generate filters');
      }

      const data = await response.json();
      console.log('[SmartFilters] Gemini raw response:', data);
      
      const text = data.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text;

      if (!text) {
        console.error('[SmartFilters] No text in response:', data);
        throw new Error('No response from Gemini');
      }
      
      console.log('[SmartFilters] Gemini text response:', text);

      // Parse the JSON response
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        // Try to extract JSON from markdown code blocks
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          parsed = JSON.parse(codeBlockMatch[1].trim());
        } else {
          const match = text.match(/\{[\s\S]*\}/);
          if (match) {
            parsed = JSON.parse(match[0]);
          } else {
            console.error('[SmartFilters] Failed to parse:', text);
            throw new Error('Failed to parse filter response');
          }
        }
      }

      if (parsed.filters && Array.isArray(parsed.filters)) {
        const aiFilters: SmartFilter[] = parsed.filters.map((f: any, index: number) => ({
          id: `ai-${f.label}-${f.value}-${index}`,
          label: f.label,
          value: f.value,
          type: 'ai-generated' as const,
        }));
        setFilters(aiFilters);
        
        // Store original rankings - use SKU as the primary key
        const rankings: Record<string, number> = {};
        activeProducts.forEach((product: any, index: number) => {
          const sku = String(product.sku || product.objectID || '').trim();
          if (sku) {
            rankings[sku] = index + 1;
          }
        });
        setOriginalRankings(rankings);
      }
    } catch (err: any) {
      console.error('Filter generation error:', err);
      setError(err.message || 'Failed to generate AI filters');
    } finally {
      setIsGeneratingFilters(false);
    }
  }, [geminiApiKey, filterPrompt, requestImages, activeProducts, imageToBase64, setFilters, setIsGeneratingFilters, setError, setOriginalRankings]);

  // Filter results using selected filters - OPTIMIZED with parallel image fetching
  const rerankResults = useCallback(async () => {
    if (!geminiApiKey) {
      setError('Please configure your Gemini API key in Admin Settings');
      return;
    }

    if (selectedFilters.length === 0) {
      setError('Please select at least one filter');
      return;
    }

    if (activeProducts.length === 0) {
      setError('No results to filter');
      return;
    }

    setIsReranking(true);
    setError(null);

    try {
      const resultsToFilter = activeProducts.slice(0, 20);
      
      // OPTIMIZATION: Fetch all images in PARALLEL
      console.log('[SmartFilters] Fetching images in parallel...');
      const startTime = Date.now();
      
      const [requestImageBase64, ...candidateImages] = await Promise.all([
        imageToBase64(requestImages[0]),
        ...resultsToFilter.map(async (result: any) => {
          const matchedImageUrl = result.matches?.[0]?.url;
          const fallbackImageUrl = result.main_image_link || result.image || result.images?.[0];
          const imageUrl = matchedImageUrl || fallbackImageUrl;
          
          if (!imageUrl) return { sku: result.sku || result.objectID, base64: null, isMatched: false };
          
          try {
            const base64 = await imageToBase64(imageUrl);
            return { 
              sku: result.sku || result.objectID, 
              base64, 
              isMatched: !!matchedImageUrl 
            };
          } catch {
            return { sku: result.sku || result.objectID, base64: null, isMatched: false };
          }
        })
      ]);
      
      console.log(`[SmartFilters] Images fetched in ${Date.now() - startTime}ms`);

      // Prepare the prompt with selected filters
      const filtersJson = JSON.stringify(selectedFilters.map(f => ({
        label: f.label,
        value: f.value,
      })));
      
      let finalPrompt = rerankPrompt.replace('{{FILTERS}}', filtersJson);
      
      // Modify prompt based on reasoning toggle
      if (!includeReasoning) {
        // Append instruction to skip reasoning for faster response
        finalPrompt += `\n\nIMPORTANT: For speed, set "reasoning" to empty string "" for all results. Focus only on accurate scoring and matching.`;
      }

      // Build content parts with ALL metadata
      const parts: any[] = [
        { text: "Request Image (the image the user is searching for):" },
        {
          inline_data: {
            mime_type: "image/jpeg",
            data: requestImageBase64,
          },
        },
        { text: "\n\nCandidate Results:\n" },
      ];

      // Add each result with FULL metadata
      resultsToFilter.forEach((result: any, i: number) => {
        const sku = result.sku || result.objectID;
        const imageData = candidateImages[i];
        
        // Build comprehensive metadata text
        const metadataLines = [
          `\n--- Candidate ${i + 1} ---`,
          `SKU: ${sku}`,
          `Title: ${result.title || result.name || sku}`,
          `Brand: ${result.brand || 'Unknown'}`,
        ];
        
        // Add description if available
        if (result.description || result.VK_Text_Englisch || result.VK_Text_Deutsch) {
          metadataLines.push(`Description: ${result.description || result.VK_Text_Englisch || result.VK_Text_Deutsch}`);
        }
        
        // Add category/type if available
        if (result.category || result.type || result.Bezeichnung) {
          metadataLines.push(`Category: ${result.category || result.type || result.Bezeichnung}`);
        }
        
        // Add keywords
        const keywords = result.keywords || result.keyword_0 || [];
        if (keywords.length > 0 || keywords) {
          metadataLines.push(`Keywords: ${Array.isArray(keywords) ? keywords.join(', ') : keywords}`);
        }
        
        // Add any other relevant fields
        if (result.material) metadataLines.push(`Material: ${result.material}`);
        if (result.size) metadataLines.push(`Size: ${result.size}`);
        if (result.color) metadataLines.push(`Color: ${result.color}`);
        
        parts.push({ text: metadataLines.join('\n') + '\n' });

        // Add image if available
        if (imageData?.base64) {
          parts.push({
            inline_data: {
              mime_type: "image/jpeg",
              data: imageData.base64,
            },
          });
          if (imageData.isMatched) {
            parts.push({ text: "(Matched image - this specific image matched the query)" });
          }
        } else {
          parts.push({ text: "[Image not available]" });
        }
      });

      parts.push({ text: `\n\n${finalPrompt}` });

      // Call Gemini API
      console.log('[SmartFilters] Sending to Gemini...');
      const geminiStart = Date.now();
      
      const response = await fetch(`${getGeminiApiUrl(geminiModel || 'gemini-2.5-flash-lite')}?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048, // Reduced for faster response
          },
        }),
      });

      console.log(`[SmartFilters] Gemini responded in ${Date.now() - geminiStart}ms`);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Gemini API error');
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        throw new Error('No response from Gemini');
      }

      // Parse the JSON response
      let parsedResponse;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseErr) {
        console.error('Parse error:', parseErr, responseText);
        throw new Error('Failed to parse Gemini response');
      }

      // Process filtered results
      if (parsedResponse.results && Array.isArray(parsedResponse.results)) {
        const rerankedResults: RerankedResult[] = parsedResponse.results
          .map((ranked: any) => {
            // Normalize SKU for matching
            const sku = String(ranked.sku || '').trim();
            return { ...ranked, sku };
          })
          .filter((ranked: any) => {
            // Only include results that we have original rankings for
            return originalRankings[ranked.sku] !== undefined;
          })
          .map((ranked: any, index: number) => ({
            sku: ranked.sku,
            score: ranked.score,
            reasoning: ranked.reasoning,
            matchedFilters: ranked.matched_filters || [],
            originalRank: originalRankings[ranked.sku],
            currentRank: index + 1,
          }));

        console.log(`[SmartFilters] Filtered to ${rerankedResults.length} matching results`);
        setRerankedResults(rerankedResults);
        setIsReranked(true);
      }
    } catch (err: any) {
      console.error('Filter error:', err);
      setError(err.message || 'Failed to filter results');
    } finally {
      setIsReranking(false);
    }
  }, [geminiApiKey, rerankPrompt, selectedFilters, activeProducts, requestImages, originalRankings, imageToBase64, setIsReranking, setError, setRerankedResults, setIsReranked, includeReasoning]);

  // Clear all filters and reranking
  const clearAll = useCallback(() => {
    clearSelectedFilters();
  }, [clearSelectedFilters]);

  // Clear image cache when component unmounts or on new search
  const clearCache = useCallback(() => {
    imageCache.clear();
    prefetchedForRef.current = '';
  }, []);

  return {
    filters,
    selectedFilters,
    generateFilters,
    rerankResults,
    clearAll,
    clearCache,
    hasGeminiKey: !!geminiApiKey,
  };
}

export default useSmartFilters;
