import { useEffect, useState, useRef, useCallback } from 'react';

import useConversationStore from 'stores/chat/conversationStore';
import useResultStore from 'stores/result/resultStore';
import useRequestStore from 'stores/request/requestStore';
import { useGoodResultsChat } from 'hooks/useGoodResultsChat';
import { useBadResultsRecovery } from 'hooks/useBadResultsRecovery';
import { chatAnalysis } from 'services/vizo';
import { compressImage } from 'utils/compressImage';
import { loadRelatedPartsTable, lookupRelatedParts } from 'utils/relatedParts';

export function useChatAssistantLogic() {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [findingRelatedParts, setFindingRelatedParts] = useState(false);

  // Conversation store
  const isEvaluated = useConversationStore(s => s.isEvaluated);
  const route = useConversationStore(s => s.route);
  const messages = useConversationStore(s => s.messages);
  const isLoading = useConversationStore(s => s.isLoading);
  const error = useConversationStore(s => s.error);
  // const startNewSession = useConversationStore(s => s.startNewSession);

  // Smart filters store (no longer requires API key)
  const hasApiKey = true;

  // Result store
  const productsFromAlgolia = useResultStore(
    state => state.productsFromAlgolia,
  );
  const productsFromFindApi = useResultStore(
    state => state.productsFromFindApi,
  );
  const firstSearchResults = useResultStore(state => state.firstSearchResults);
  const firstAlgoliaProducts = useResultStore(
    state => state.firstAlgoliaProducts,
  );
  const setAlgoliaProducts = useResultStore(state => state.setAlgoliaProducts);
  const setFirstAlgoliaProducts = useResultStore(
    state => state.setFirstAlgoliaProducts,
  );
  const setFindApiProducts = useResultStore(state => state.setFindApiProducts);
  const setFullResultPool = useResultStore(state => state.setFullResultPool);
  const imageAnalysis = useResultStore(state => state.imageAnalysis);

  const isAlgoliaEnabled = !!(window as any).settings?.algolia?.enabled;
  const activeProducts = isAlgoliaEnabled
    ? productsFromAlgolia
    : productsFromAlgolia.length > 0
      ? productsFromAlgolia
      : productsFromFindApi;

  // Request store
  const requestImages = useRequestStore(state => state.requestImages);

  const p2TriggeredRef = useRef(false);

  // Hooks for P2, P3, P5, P6, P7
  const { sendMessage: sendP3Message } = useGoodResultsChat();
  const { sendMessage: sendP5Message } = useBadResultsRecovery();

  // P7 state
  const p7TriggeredRef = useRef(false);
  const [p7Running, setP7Running] = useState(false);
  const [p7Done, setP7Done] = useState(false);

  // Catalog search state
  const [catalogSearchReady, setCatalogSearchReady] = useState(false);
  const [catalogSearching, setCatalogSearching] = useState(false);

  // Helper to get the correct product setter
  const getSetProducts = useCallback(() => {
    return isAlgoliaEnabled
      ? setAlgoliaProducts
      : productsFromAlgolia.length > 0
        ? setAlgoliaProducts
        : setFindApiProducts;
  }, [
    isAlgoliaEnabled,
    productsFromAlgolia.length,
    setAlgoliaProducts,
    setFindApiProducts,
  ]);

  // Trigger P2 evaluation
  useEffect(() => {
    if (
      !isEvaluated &&
      !p2TriggeredRef.current &&
      activeProducts.length > 0 &&
      hasApiKey &&
      requestImages[0]
    ) {
      p2TriggeredRef.current = true;
      setFirstAlgoliaProducts([...activeProducts]);
      // evaluateResults();
    }
  }, [
    isEvaluated,
    activeProducts,
    hasApiKey,
    requestImages,

    setFirstAlgoliaProducts,
  ]);

  // Reset P7 flags when session resets
  useEffect(() => {
    if (!isEvaluated) {
      p2TriggeredRef.current = false;
      p7TriggeredRef.current = false;
      setP7Running(false);
      setP7Done(false);
    }
  }, [isEvaluated]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Handlers ──

  const handleRelatedPartSearch = useCallback(
    async (message: string) => {
      const store = useConversationStore.getState();
      const relatedPart = store.pendingRelatedPart;
      if (!relatedPart) return;

      // Empty input → search for the part name as-is
      if (!message) {
        store.setPendingRelatedPart(null);
        store.setAwaitingDescription(false);
        store.addMessage({ role: 'user', content: relatedPart });
      } else {
        store.addMessage({ role: 'user', content: message });

        // Check if user input contains relevant specs for the selected part
        store.setIsLoading(true);
        try {
          const response = await chatAnalysis({
            promptKey: 'product_tagging_prompt',
            multimodalInputs: [
              {
                metadata: `The user is looking for a "${relatedPart}". They were asked to provide specifications like brand, size, connection type, or model.\n\nThey responded: "${message}"\n\nDoes this response contain actual product specifications, attributes, brand names, model numbers, dimensions, or any useful search criteria for finding a "${relatedPart}"?\n\nReturn JSON only:\n{"relevant": true/false, "suggestion": "If not relevant, a brief helpful hint about what details to provide for a ${relatedPart}"}`,
              },
            ],
          });

          const check = response;

          if (!check.relevant) {
            store.setIsLoading(false);
            const hint =
              check.suggestion ||
              `Try specifying a brand, size, or connection type for the ${relatedPart}.`;
            store.addMessage({
              role: 'assistant',
              content: `That doesn't seem like product specifications for a **${relatedPart}**. ${hint}\n\nYou can also text search in catalog.`,
              options: [
                {
                  label: 'Text search in catalog',
                  action_type: 'catalog_search_text' as const,
                  key: 'catalog_search_text',
                  value: 'catalog_search_text',
                },
              ],
            });
            return;
          }
        } catch (err) {
          console.warn(
            '[RelatedParts] Relevance check failed, proceeding anyway:',
            err,
          );
        } finally {
          store.setIsLoading(false);
        }

        store.setPendingRelatedPart(null);
        store.setAwaitingDescription(false);
      }

      const combinedQuery = message ? `${relatedPart} ${message}` : relatedPart;
      store.setIsLoading(true);
      setCatalogSearching(true);

      try {
        const settings = (window as any).settings;
        const nyrisKey = settings?.apiKey || settings?.nyrisApiKey;
        const baseUrl = settings?.baseUrl || 'https://api.nyris.io';

        let searchQuery = combinedQuery;

        try {
          const response = await chatAnalysis({
            promptKey: 'product_tagging_prompt',
            multimodalInputs: [
              {
                metadata: `Extract only the product search keywords from this user message. Remove filler words, conversational phrases, and intent words. Return ONLY the clean search terms.\n\nUser message: "${combinedQuery} return only json {query: "clean search terms here"}"`,
              },
            ],
          });

          const cleaned = response.query;
          if (cleaned) {
            searchQuery = cleaned.replace(/^["']|["']$/g, '');
          }
        } catch (cleanErr) {
          console.warn(
            '[RelatedParts] Query cleaning failed, using raw:',
            cleanErr,
          );
        }

        store.setPreCatalogResults([...activeProducts]);

        const formData = new FormData();
        formData.append('text', searchQuery);
        const res = await fetch(`${baseUrl}/find/v1.1`, {
          method: 'POST',
          headers: {
            'X-Api-Key': nyrisKey,
            Accept: 'application/offers.complete+json',
          },
          body: formData,
        });
        const data = await res.json();
        const results = data?.results || [];

        const setProducts = isAlgoliaEnabled
          ? setAlgoliaProducts
          : productsFromAlgolia.length > 0
            ? setAlgoliaProducts
            : setFindApiProducts;

        if (results.length > 0) {
          setProducts(results);
          setFullResultPool(results);
          store.setIsLoading(false);
          await sendP3Message(
            `I searched the catalog for "${searchQuery}" and got ${results.length} results. Suggest filters to help narrow down.`,
            { silent: true },
          );
        } else {
          const original =
            firstSearchResults.length > 0
              ? firstSearchResults
              : firstAlgoliaProducts;
          if (original.length > 0) {
            setProducts(original);
            setFullResultPool(original);
          }
          const freshStore = useConversationStore.getState();
          freshStore.setPreCatalogResults(null);
          freshStore.clearFilters();
          freshStore.addMessage({
            role: 'assistant',
            content: `I couldn't find "${searchQuery}" in the catalog. Here are your original results — try different specs or another related part.`,
            options:
              freshStore.openingOptions.length > 0
                ? freshStore.openingOptions
                : undefined,
          });
        }
      } catch (err) {
        console.error('[RelatedParts] Catalog search failed:', err);
        const original =
          firstSearchResults.length > 0
            ? firstSearchResults
            : firstAlgoliaProducts;
        if (original.length > 0) {
          const setProducts = isAlgoliaEnabled
            ? setAlgoliaProducts
            : productsFromAlgolia.length > 0
              ? setAlgoliaProducts
              : setFindApiProducts;
          setProducts(original);
          setFullResultPool(original);
        }
        const freshStore = useConversationStore.getState();
        freshStore.setPreCatalogResults(null);
        freshStore.clearFilters();
        freshStore.addMessage({
          role: 'assistant',
          content:
            'Something went wrong searching for related parts. Here are your original results.',
          options:
            freshStore.openingOptions.length > 0
              ? freshStore.openingOptions
              : undefined,
        });
      } finally {
        store.setIsLoading(false);
        setCatalogSearching(false);
      }
    },
    [
      activeProducts,
      firstAlgoliaProducts,
      firstSearchResults,
      isAlgoliaEnabled,
      productsFromAlgolia.length,
      sendP3Message,
      setAlgoliaProducts,
      setFindApiProducts,
      setFullResultPool,
    ],
  );

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue.trim();
    setInputValue('');
    setCatalogSearchReady(true);

    const store = useConversationStore.getState();
    const relatedPart = store.pendingRelatedPart;

    // if (relatedPart) {
    //   await handleRelatedPartSearch(message);
    //   return;
    // }

    if (!message) return;

    if (route === 'P3') {
      await sendP3Message(message);
    } else if (route === 'P5') {
      await sendP5Message(message);
    } else {
      await sendP3Message(message);
    }
  }, [
    handleRelatedPartSearch,
    inputValue,
    isLoading,
    route,
    sendP3Message,
    sendP5Message,
  ]);

  const handleOptionClick = useCallback(
    async (option: any) => {
      if (option.action_type === 'text_search_prompt') {
        setInputValue('');
        const store = useConversationStore.getState();
        store.setAwaitingDescription(true);
        store.addMessage({
          role: 'assistant',
          content:
            "What are you looking for? I'll check the current results first. The more details you share — like brand, model, or specs — the better I can help!",
        });
        return;
      }

      if (option.action_type === 'catalog_search_image') {
        await handleCatalogSearchWithImage();
        return;
      }

      if (option.action_type === 'catalog_search_text') {
        await handleCatalogSearchWithText();
        return;
      }

      if (option.action_type === 'find_related_parts') {
        await handleFindRelatedParts();
        return;
      }

      // Related part selected — prompt user for specs, then search catalog
      if (option.action_type === 'related_part') {
        const partName = option.value || option.label;
        const store = useConversationStore.getState();
        store.setPendingRelatedPart(partName);
        store.setAwaitingDescription(true);
        store.addMessage({
          role: 'assistant',
          content: `You're looking for a **${partName}**. Can you share any details like brand, size, connection type, or model? The more specific you are, the better results I can find.\n\nOr just press Enter to search for "${partName}" as-is.`,
        });
        setInputValue(partName);
        return;
      }

      if (option.action_type === 'restore_original') {
        const store = useConversationStore.getState();
        const originalResults = isAlgoliaEnabled
          ? firstAlgoliaProducts.length > 0
            ? firstAlgoliaProducts
            : firstSearchResults
          : firstSearchResults.length > 0
            ? firstSearchResults
            : firstAlgoliaProducts;

        const restoreResults =
          originalResults.length > 0
            ? originalResults
            : store.preCatalogResults;

        if (restoreResults && restoreResults.length > 0) {
          const setProducts = getSetProducts();
          setProducts(restoreResults);
          setFullResultPool(restoreResults);
          store.setPreCatalogResults(null);
          store.addMessage({
            role: 'assistant',
            content: `Restored your original ${restoreResults.length} result${restoreResults.length === 1 ? '' : 's'} from the initial image search. Feel free to keep filtering or run a new catalog search.`,
          });
        } else {
          store.addMessage({
            role: 'assistant',
            content:
              "I couldn't find the original search results to restore yet. Please run an image search first.",
          });
        }
        return;
      }

      const message = option.value || option.label;
      setInputValue('');

      if (route === 'P3') {
        await sendP3Message(message);
      } else if (route === 'P5') {
        await sendP5Message(message);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      route,
      sendP3Message,
      sendP5Message,
      getSetProducts,
      setFullResultPool,
      isAlgoliaEnabled,
      firstAlgoliaProducts,
      firstSearchResults,
    ],
  );

  const handleImageUpload = useCallback(
    async (file: File | string) => {
      const store = useConversationStore.getState();
      const imageUrl =
        typeof file === 'string' ? file : URL.createObjectURL(file);

      store.addMessage({
        role: 'user',
        content: 'Uploaded an image to refine search',
        imageUrl,
      });

      store.setIsLoading(true);
      store.setPendingCatalogImage(file);

      try {
        const currentProducts = [...activeProducts];

        if (currentProducts.length === 0) {
          store.addMessage({
            role: 'assistant',
            content:
              currentProducts.length === 0
                ? 'No current results to refine. You can search the catalog with this image.'
                : 'Unable to analyze the image. You can search the catalog directly.',
            options: [
              {
                label: 'Search catalog with this image',
                action_type: 'catalog_search_image' as const,
                key: 'catalog_search',
                value: 'image',
              },
            ],
          });
          return;
        }

        const [newBase64, origBase64] = await Promise.all([
          (async () => {
            try {
              const normalizedInput =
                typeof file === 'string' &&
                !file.includes(',') &&
                !file.startsWith('https:')
                  ? `data:image/jpeg;base64,${file}`
                  : file;
              const compressedDataUrl = await compressImage(normalizedInput);
              return compressedDataUrl.includes(',')
                ? compressedDataUrl.split(',')[1] || ''
                : compressedDataUrl;
            } catch (compressionError) {
              console.warn(
                '[ChatAssistant] Image compression failed, using original image:',
                compressionError,
              );
              if (typeof file === 'string') {
                return file.includes(',') ? file.split(',')[1] : file;
              }
              return await new Promise<string>(resolve => {
                const reader = new FileReader();
                reader.onload = () =>
                  resolve((reader.result as string).split(',')[1] || '');
                reader.readAsDataURL(file);
              });
            }
          })(),
          requestImages[0]
            ? Promise.resolve(
                requestImages[0].toDataURL('image/jpeg', 0.7).split(',')[1] ||
                  '',
              )
            : Promise.resolve(''),
        ]);

        const productList = currentProducts
          .slice(0, 50)
          .map((p: any, i: number) => ({
            rank: i + 1,
            sku: p.sku || p.objectID || `product-${i}`,
            title: p.title || p.name || 'Untitled',
            brand: p.brand || '',
            description: (p.description || '').substring(0, 150),
            categories: p.categories || [],
            mpn: p.customIds?.mpn || p.ids?.mpn || '',
          }));

        const productListText = productList
          .map(
            r =>
              `${r.rank}. [${r.sku}] ${r.title} | brand: ${r.brand} | mpn: ${r.mpn} | categories: ${JSON.stringify(r.categories)}`,
          )
          .join('\n');

        const parts: {
          inlineData?: { mimeType: string; data: string };
          text?: string;
        }[] = [];
        if (origBase64) {
          parts.push({
            inlineData: { mimeType: 'image/jpeg', data: origBase64 },
          });
        }
        parts.push({
          inlineData: { mimeType: 'image/jpeg', data: newBase64 },
        });
        // category: result_evaluator_prompt
        parts.push({
          text: `The user is searching for industrial products. They originally uploaded the first image and got these results. Now they uploaded a NEW image (the ${origBase64 ? 'second' : 'only'} image) to refine their search.

CURRENT RESULTS:
${productListText}

Based on the NEW image, which of the current results best match what the user is looking for? Consider visual similarity, product type, brand, and specifications.

Return JSON only, no markdown:
{
  "matched_indices": [1, 3, 7],
  "message": "Brief explanation of what you matched and why (2-3 sentences)"
}

If NONE of the current results match the new image, return:
{
  "matched_indices": [],
  "message": "Brief explanation of why none match"
}`,
        });

        const response = await chatAnalysis({
          promptKey: 'product_tagging_prompt',
          multimodalInputs: parts.map(p =>
            p.inlineData
              ? {
                  metadata: '',
                  mimeType: p.inlineData.mimeType,
                  image: p.inlineData.data,
                }
              : { metadata: p.text || '' },
          ),
        });

        const parsed = response;
        const matchedIndices: number[] = parsed.matched_indices || [];
        const aiMessage: string = parsed.message || '';

        const setProducts = getSetProducts();

        if (matchedIndices.length > 0) {
          const filteredProducts = matchedIndices
            .filter(i => i >= 1 && i <= currentProducts.length)
            .map(i => currentProducts[i - 1]);

          if (filteredProducts.length > 0) {
            setProducts(filteredProducts);
            store.addMessage({
              role: 'assistant',
              content: `${aiMessage}\n\nI found ${filteredProducts.length} matching product${filteredProducts.length === 1 ? '' : 's'} from the current results. Want me to search the full catalog for more options?`,
              options: [
                {
                  label: 'Search catalog with this image',
                  action_type: 'catalog_search_image' as const,
                  key: 'catalog_search',
                  value: 'image',
                },
              ],
            });
          } else {
            store.addMessage({
              role: 'assistant',
              content: `${aiMessage}\n\nI couldn't find those items in the current results. Let me search the full catalog for you.`,
              options: [
                {
                  label: 'Search catalog with this image',
                  action_type: 'catalog_search_image' as const,
                  key: 'catalog_search',
                  value: 'image',
                },
              ],
            });
          }
        } else {
          store.addMessage({
            role: 'assistant',
            content: `${aiMessage}\n\nThis doesn't match the current results. Would you like to search the full catalog?`,
            options: [
              {
                label: 'Search catalog with this image',
                action_type: 'catalog_search_image' as const,
                key: 'catalog_search',
                value: 'image',
              },
            ],
          });
        }
      } catch (err: any) {
        console.error('[ChatAssistant] Image refinement failed:', err);
        store.addMessage({
          role: 'assistant',
          content:
            'I had trouble analyzing that image. You can try searching the catalog directly instead.',
          options: [
            {
              label: 'Search catalog with this image',
              action_type: 'catalog_search_image' as const,
              key: 'catalog_search',
              value: 'image',
            },
          ],
        });
      } finally {
        store.setIsLoading(false);
      }
    },
    [activeProducts, requestImages, getSetProducts],
  );

  const handleCatalogSearchWithImage = useCallback(async () => {
    const store = useConversationStore.getState();
    const file = store.pendingCatalogImage;
    if (!file) return;

    store.setIsLoading(true);
    setCatalogSearching(true);
    try {
      const settings = (window as any).settings;
      const nyrisKey = settings?.apiKey || settings?.nyrisApiKey;
      const baseUrl = settings?.baseUrl || 'https://api.nyris.io';

      store.setPreCatalogResults([...activeProducts]);

      const formData = new FormData();
      if (typeof file === 'string') {
        const base64Data = file.includes(',') ? file.split(',')[1] : file;
        const mimeMatch = file.match(/^data:([^;]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const byteChars = atob(base64Data);
        const byteArray = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteArray[i] = byteChars.charCodeAt(i);
        }
        formData.append(
          'image',
          new Blob([byteArray], { type: mimeType }),
          'image.jpg',
        );
      } else {
        formData.append('image', file);
      }
      const res = await fetch(`${baseUrl}/find/v1.1`, {
        method: 'POST',
        headers: {
          'X-Api-Key': nyrisKey,
          Accept: 'application/offers.complete+json',
        },
        body: formData,
      });
      const data = await res.json();
      const results = data?.results || [];

      const setProducts = getSetProducts();

      if (results.length > 0) {
        setProducts(results);
        setFullResultPool(results);
        store.setIsLoading(false);
        await sendP3Message(
          `I searched the catalog with an image and got ${results.length} results. What filters can I use to narrow them down? Suggest filter options like brand, voltage, type, or other attributes.`,
          { silent: true },
        );
      } else {
        const prev = store.preCatalogResults;
        if (prev) {
          setProducts(prev);
          setFullResultPool(prev);
        }
        store.setPreCatalogResults(null);
        store.addMessage({
          role: 'assistant',
          content:
            "I couldn't find any matches for that image in the catalog. No worries — I've brought back your previous results.",
        });
      }
    } catch (err: any) {
      console.error('[ChatAssistant] Catalog image search failed:', err);
      const prev = store.preCatalogResults;
      if (prev) {
        const setProducts = getSetProducts();
        setProducts(prev);
        setFullResultPool(prev);
      }
      store.setPreCatalogResults(null);
      store.addMessage({
        role: 'assistant',
        content:
          "Something went wrong with the catalog search. Don't worry — your previous results are still here.",
      });
    } finally {
      store.setPendingCatalogImage(null);
      store.setIsLoading(false);
      setCatalogSearching(false);
    }
  }, [activeProducts, getSetProducts, setFullResultPool, sendP3Message]);

  const handleCatalogSearchWithText = useCallback(async () => {
    const store = useConversationStore.getState();
    const lastUserMsg = [...store.messages]
      .reverse()
      .find(m => m.role === 'user');
    const rawText = lastUserMsg?.content || '';
    if (!rawText) {
      store.addMessage({
        role: 'assistant',
        content: 'Please type a query first so I can search the catalog.',
      });
      return;
    }

    store.setIsLoading(true);
    setCatalogSearchReady(false);
    setCatalogSearching(true);

    try {
      const settings = (window as any).settings;
      const nyrisKey = settings?.apiKey || settings?.nyrisApiKey;
      const baseUrl = settings?.baseUrl || 'https://api.nyris.io';

      let searchQuery = rawText;

      const response = await chatAnalysis({
        promptKey: 'product_tagging_prompt',
        multimodalInputs: [
          {
            metadata: `Extract only the product search keywords from this user message. Remove filler words, conversational phrases, and intent words. Return ONLY the clean search terms, nothing else.\n\nExamples:\n"I need to look for a 100v connector" → "100V connector"\n"show me Schneider Electric blue LED lights" → "Schneider Electric blue LED light"\n"search for light block with more than 500 volts" → "light block 500V"\n\nUser message: "${rawText}" return only json {query: "clean search terms here"}`,
          },
        ],
      });

      try {
        const cleaned = response?.query.trim();
        if (cleaned) {
          searchQuery = cleaned.replace(/^["']|["']$/g, '');
        }
      } catch (cleanErr) {
        console.warn(
          '[ChatAssistant] Query cleaning failed, using raw text:',
          cleanErr,
        );
      }

      store.setPreCatalogResults([...activeProducts]);

      const formData = new FormData();
      formData.append('text', searchQuery);
      const res = await fetch(`${baseUrl}/find/v1.1`, {
        method: 'POST',
        headers: {
          'X-Api-Key': nyrisKey,
          Accept: 'application/offers.complete+json',
        },
        body: formData,
      });
      const data = await res.json();
      const results = data?.results || [];

      const setProducts = getSetProducts();

      if (results.length > 0) {
        setProducts(results);
        setFullResultPool(results);
        store.setIsLoading(false);
        await sendP3Message(
          `I searched the catalog for "${searchQuery}" and got these ${results.length} results. What filters can I use to narrow them down? Suggest filter options like brand, voltage, type, or other attributes.`,
          { silent: true },
        );
      } else {
        const prev = store.preCatalogResults;
        if (prev) {
          setProducts(prev);
          setFullResultPool(prev);
        }
        store.setPreCatalogResults(null);
        store.addMessage({
          role: 'assistant',
          content: `I couldn't find anything matching "${searchQuery}" in the catalog. I've brought back your previous results.`,
        });
      }
    } catch (err: unknown) {
      console.error('[ChatAssistant] Catalog search failed:', err);
      const prev = store.preCatalogResults;
      if (prev) {
        const setProducts = getSetProducts();
        setProducts(prev);
        setFullResultPool(prev);
      }
      store.setPreCatalogResults(null);
      store.addMessage({
        role: 'assistant',
        content:
          'Something went wrong with the catalog search. Your previous results are still here.',
      });
    } finally {
      store.setPendingCatalogText(null);
      store.setIsLoading(false);
      setCatalogSearching(false);
    }
  }, [activeProducts, getSetProducts, setFullResultPool, sendP3Message]);

  // Handle "Find related parts" — checks lookup table first, falls back to Gemini
  const handleFindRelatedParts = async () => {
    const store = useConversationStore.getState();
    store.setIsLoading(true);
    // store.setRelatedPartsUsed(true);
    setFindingRelatedParts(true);

    try {
      const productDesc = [
        imageAnalysis.imageDescription,
        imageAnalysis.optimizedSearchQuery,
        Object.entries(imageAnalysis.specification || {})
          .map(([k, v]) => `${k}: ${v}`)
          .join(', '),
      ]
        .filter(Boolean)
        .join('. ');

      // 1. Try the lookup table first (instant, no API call)
      const table = await loadRelatedPartsTable();
      const requestImageKeyword =
        useConversationStore.getState().requestImageKeyword;
      const tableSuggestions = lookupRelatedParts(
        table,
        requestImageKeyword || productDesc || '',
      );

      if (tableSuggestions && tableSuggestions.length > 0) {
        const options = tableSuggestions.map(s => ({
          label: s.label,
          action_type: 'related_part' as const,
          value: s.label,
          key: `related_${s.label.toLowerCase().replace(/\s+/g, '_')}`,
        }));
        store.addMessage({
          role: 'assistant',
          content: `Here are some parts and accessories commonly associated with this product. Select one to search the catalog:\n\n${tableSuggestions.map(s => `• **${s.label}** — ${s.description}`).join('\n')}`,
          options,
        });
        return;
      }
    } catch (err) {
      console.error('[RelatedParts] Failed:', err);
      store.addMessage({
        role: 'assistant',
        content:
          'Something went wrong while looking up related parts. Please try again.',
      });
    } finally {
      store.setIsLoading(false);
      setFindingRelatedParts(false);
    }
  };

  return {
    // State
    inputValue,
    setInputValue,
    messages,
    isLoading,
    isEvaluated,
    error,
    hasApiKey,
    route,
    p7Running,
    p7Done,
    catalogSearchReady,
    catalogSearching,
    activeProducts,
    productsFromAlgolia,
    findingRelatedParts,

    // Refs
    messagesEndRef,
    imageInputRef,

    // Handlers
    handleSendMessage,
    handleOptionClick,
    handleImageUpload,
    handleCatalogSearchWithImage,
    handleCatalogSearchWithText,
    handleFindRelatedParts,
  };
}
