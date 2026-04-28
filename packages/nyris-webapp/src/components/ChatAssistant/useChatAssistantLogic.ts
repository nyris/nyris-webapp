import { useEffect, useState, useRef, useCallback } from 'react';

import useConversationStore from 'stores/chat/conversationStore';
import useSmartFiltersStore from 'stores/smartFilters/smartFiltersStore';
import useResultStore from 'stores/result/resultStore';
import useRequestStore from 'stores/request/requestStore';
import { useGoodResultsChat } from 'hooks/useGoodResultsChat';
import { useBadResultsRecovery } from 'hooks/useBadResultsRecovery';
import { chatAnalysis } from 'services/vizo';

export function useChatAssistantLogic() {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Conversation store
  const isEvaluated = useConversationStore(s => s.isEvaluated);
  const route = useConversationStore(s => s.route);
  const messages = useConversationStore(s => s.messages);
  const isLoading = useConversationStore(s => s.isLoading);
  const error = useConversationStore(s => s.error);
  // const startNewSession = useConversationStore(s => s.startNewSession);

  // Smart filters store
  const geminiApiKey = useSmartFiltersStore(s => s.geminiApiKey);

  const geminiModel = useSmartFiltersStore(s => s.geminiModel);
  const chatWithDbEnabled = useSmartFiltersStore(s => s.chatWithDbEnabled);
  const googleGroundingEnabled = useSmartFiltersStore(
    s => s.googleGroundingEnabled,
  );
  const hasApiKey = Boolean(geminiApiKey);

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

  // ── Lifecycle effects ──

  // On mount, clear stale conversation state only if there are no messages.
  // If isEvaluated=true but messages exist, evaluateResults fired before this
  // component mounted (e.g. from useImageSearch) — those messages are fresh and
  // must not be wiped. The firstSearchResults effect handles resets on new searches.
  // useEffect(() => {
  //   if (!hasMountedRef.current) {
  //     hasMountedRef.current = true;
  //     if (isEvaluated && messages.length === 0) {
  //       startNewSession();
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // Reset conversation when new search results arrive
  // useEffect(() => {
  //   if (firstSearchResults.length === 0) return;
  //   const resultsSignature = firstSearchResults
  //     .slice(0, 5)
  //     .map((p: any) => p.sku || p.objectID || p.title)
  //     .join('|');
  //   if (
  //     previousResultsRef.current !== resultsSignature &&
  //     previousResultsRef.current !== ''
  //   ) {
  //     startNewSession();
  //   }
  //   previousResultsRef.current = resultsSignature;
  // }, [firstSearchResults, startNewSession]);

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

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue.trim();
    setInputValue('');
    setCatalogSearchReady(true);

    if (route === 'P3') {
      await sendP3Message(message);
    } else if (route === 'P5') {
      await sendP5Message(message);
    } else {
      await sendP3Message(message);
    }
  }, [inputValue, isLoading, route, sendP3Message, sendP5Message]);

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
        const geminiKey = geminiApiKey || process.env.REACT_APP_GEMINI_API_KEY;
        const currentProducts = [...activeProducts];

        if (!geminiKey || currentProducts.length === 0) {
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
          typeof file === 'string'
            ? Promise.resolve(file.includes(',') ? file.split(',')[1] : file)
            : new Promise<string>(resolve => {
                const reader = new FileReader();
                reader.onload = () =>
                  resolve((reader.result as string).split(',')[1] || '');
                reader.readAsDataURL(file);
              }),
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
        const geminiMessage: string = parsed.message || '';

        const setProducts = getSetProducts();

        if (matchedIndices.length > 0) {
          const filteredProducts = matchedIndices
            .filter(i => i >= 1 && i <= currentProducts.length)
            .map(i => currentProducts[i - 1]);

          if (filteredProducts.length > 0) {
            setProducts(filteredProducts);
            store.addMessage({
              role: 'assistant',
              content: `${geminiMessage}\n\nI found ${filteredProducts.length} matching product${filteredProducts.length === 1 ? '' : 's'} from the current results. Want me to search the full catalog for more options?`,
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
              content: `${geminiMessage}\n\nI couldn't find those items in the current results. Let me search the full catalog for you.`,
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
            content: `${geminiMessage}\n\nThis doesn't match the current results. Would you like to search the full catalog?`,
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
    [geminiApiKey, activeProducts, requestImages, getSetProducts],
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
          '[ChatAssistant] Gemini cleaning failed, using raw text:',
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

    // Refs
    messagesEndRef,
    imageInputRef,

    // Handlers
    handleSendMessage,
    handleOptionClick,
    handleImageUpload,
    handleCatalogSearchWithImage,
    handleCatalogSearchWithText,
  };
}
