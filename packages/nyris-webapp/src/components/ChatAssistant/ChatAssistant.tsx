/**
 * Chat Assistant Component — Vizo Search Assistant
 *
 * Implements the P2/P3/P5/P6/P7 architecture for the nyris Search Assistant.
 * - P2: Result Evaluator (fires once on results load)
 * - P3: Good Results Conversation (filter, compare, identify)
 * - P5: Bad Results Recovery (clarify, resurface, max 3 attempts)
 * - P6: Chat with DB – extract filters from product description, query full index / MongoDB
 * - P7: Google Grounding – validate bad results via Google Search (parallel with P5)
 */

import { memo, useEffect, useState, useRef, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';
import {
  Sparkles,
  Send,
  Loader2,
  RotateCcw,
  AlertCircle,
  Globe,
  X,
  Camera,
} from 'lucide-react';

import useConversationStore from 'stores/chat/conversationStore';
import useSmartFiltersStore from 'stores/smartFilters/smartFiltersStore';
import useResultStore from 'stores/result/resultStore';
import useRequestStore from 'stores/request/requestStore';
import { useResultEvaluator } from 'hooks/useResultEvaluator';
import {
  useGoodResultsChat,
  deduplicateProducts,
} from 'hooks/useGoodResultsChat';
import { useBadResultsRecovery } from 'hooks/useBadResultsRecovery';
import {
  useChatWithDb,
  looksLikeProductDescription,
} from 'hooks/useChatWithDb';
import { useGoogleGrounding } from 'hooks/useGoogleGrounding';

function ChatAssistant() {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Conversation store
  // Zustand selectors — subscribe to individual fields to avoid unnecessary re-renders
  const isOpen = useConversationStore(s => s.isOpen);
  const setIsOpen = useConversationStore(s => s.setIsOpen);
  const isEvaluated = useConversationStore(s => s.isEvaluated);
  const route = useConversationStore(s => s.route);
  const attemptCounter = useConversationStore(s => s.attemptCounter);
  const messages = useConversationStore(s => s.messages);
  const isLoading = useConversationStore(s => s.isLoading);
  const error = useConversationStore(s => s.error);
  const resetConversation = useConversationStore(s => s.reset);
  const startNewSession = useConversationStore(s => s.startNewSession);

  // Smart filters store — individual selectors
  const geminiApiKey = useSmartFiltersStore(s => s.geminiApiKey);
  const geminiModel = useSmartFiltersStore(s => s.geminiModel);
  const setShowAdminSettings = useSmartFiltersStore(
    s => s.setShowAdminSettings,
  );
  const chatWithDbEnabled = useSmartFiltersStore(s => s.chatWithDbEnabled);
  const googleGroundingEnabled = useSmartFiltersStore(
    s => s.googleGroundingEnabled,
  );
  const hasApiKey = Boolean(
    geminiApiKey || (window as any).settings?.smartFilters?.geminiApiKey,
  );

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

  // Request store - to detect new image uploads
  const requestImages = useRequestStore(state => state.requestImages);

  // Track first search results to detect new searches
  const previousResultsRef = useRef<string>('');
  const hasMountedRef = useRef(false);

  // Hooks for P2, P3, P5, P6 (Chat with DB), P7 (Google Grounding)
  const { evaluateResults } = useResultEvaluator();
  const { sendMessage: sendP3Message } = useGoodResultsChat();
  const { sendMessage: sendP5Message } = useBadResultsRecovery();
  const { sendMessage: sendP6Message } = useChatWithDb();
  const { runGrounding, applyGroundingResult } = useGoogleGrounding();

  // Track P7 grounding status
  const p7TriggeredRef = useRef(false);
  const [p7Running, setP7Running] = useState(false);
  const [p7Done, setP7Done] = useState(false);

  // On mount, clear stale conversation state (e.g. from HMR or navigation)
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (isEvaluated) {
        console.log('[ChatAssistant] Clearing stale session on mount');
        startNewSession();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset conversation when new search results arrive (new image search)
  useEffect(() => {
    if (firstSearchResults.length === 0) return;

    const resultsSignature = firstSearchResults
      .slice(0, 5)
      .map((p: any) => p.sku || p.objectID || p.title)
      .join('|');

    if (
      previousResultsRef.current !== resultsSignature &&
      previousResultsRef.current !== ''
    ) {
      console.log('[ChatAssistant] New search detected, resetting session');
      startNewSession();
    }

    previousResultsRef.current = resultsSignature;
  }, [firstSearchResults, startNewSession]);

  // Trigger P2 evaluation when results are available and not yet evaluated
  useEffect(() => {
    console.log('[ChatAssistant] P2 trigger check:', {
      isEvaluated,
      activeProductsLength: activeProducts.length,
      hasApiKey,
      hasImage: !!requestImages[0],
    });
    if (
      !isEvaluated &&
      activeProducts.length > 0 &&
      hasApiKey &&
      requestImages[0]
    ) {
      console.log('[ChatAssistant] Triggering P2 evaluation');
      setFirstAlgoliaProducts([...activeProducts]);
      // Note: fullResultPool is already set by useImageSearch with all 50 results
      // Do NOT overwrite it here with the displayed 20
      evaluateResults();
    }
  }, [
    isEvaluated,
    activeProducts,
    hasApiKey,
    requestImages,
    evaluateResults,
    setFirstAlgoliaProducts,
  ]);

  // Trigger product tagging after P2 completes (runs in background, non-blocking)
  useEffect(() => {
    if (isEvaluated && activeProducts.length > 0 && hasApiKey) {
      const sessionId = useConversationStore.getState().sessionId;
    }
  }, [isEvaluated, activeProducts.length, hasApiKey]);

  // P7: Fire Google Grounding on every search (testing mode)
  useEffect(() => {
    if (isEvaluated && !p7TriggeredRef.current && googleGroundingEnabled) {
      p7TriggeredRef.current = true;
      setP7Running(true);
      console.log(
        `[ChatAssistant] Triggering P7 Google Grounding (route=${route}, testing mode — runs on every search)`,
      );

      runGrounding().then(async result => {
        setP7Running(false);
        setP7Done(true);
        if (result) {
          console.log('[ChatAssistant] P7 completed, applying result');
          await applyGroundingResult(result);
        } else {
          console.log('[ChatAssistant] P7 returned null');
        }
      });
    }
  }, [
    isEvaluated,
    route,
    googleGroundingEnabled,
    runGrounding,
    applyGroundingResult,
  ]);

  // Reset P7 flags when session resets
  useEffect(() => {
    if (!isEvaluated) {
      p7TriggeredRef.current = false;
      setP7Running(false);
      setP7Done(false);
    }
  }, [isEvaluated]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');

    // P6: Chat with DB – when message looks like product description (5+ words, IDs/specs)
    if (chatWithDbEnabled && looksLikeProductDescription(message)) {
      await sendP6Message(message);
      return;
    }

    // Route to P3 or P5 based on evaluation result
    if (route === 'P3') {
      await sendP3Message(message);
    } else if (route === 'P5') {
      await sendP5Message(message);
    } else {
      // Fallback: use P3 if not yet evaluated
      await sendP3Message(message);
    }
  }, [
    inputValue,
    isLoading,
    chatWithDbEnabled,
    route,
    sendP3Message,
    sendP5Message,
    sendP6Message,
  ]);

  // Handle quick reply option click
  const handleOptionClick = async (option: any) => {
    // If user clicks "Describe what you're looking for", focus input with a prompt
    if (option.action_type === 'text_search_prompt') {
      setInputValue('');
      inputRef.current?.focus();
      const store = useConversationStore.getState();
      store.setAwaitingDescription(true);
      store.addMessage({
        role: 'assistant',
        content:
          "What are you looking for? I'll check the current results first. The more details you share — like brand, model, or specs — the better I can help!",
      });
      return;
    }

    // Deferred catalog search with image
    if (option.action_type === 'catalog_search_image') {
      await handleCatalogSearchWithImage();
      return;
    }

    // Deferred catalog search with text
    if (option.action_type === 'catalog_search_text') {
      await handleCatalogSearchWithText();
      return;
    }

    // Restore previous results (go back from catalog search)
    if (option.action_type === 'restore_previous') {
      const store = useConversationStore.getState();
      const prev = store.preCatalogResults;
      if (prev && prev.length > 0) {
        const setProducts = isAlgoliaEnabled
          ? setAlgoliaProducts
          : productsFromAlgolia.length > 0
            ? setAlgoliaProducts
            : setFindApiProducts;
        setProducts(prev);
        setFullResultPool(prev);
        store.setPreCatalogResults(null);
        store.addMessage({
          role: 'assistant',
          content: `Here are your previous ${prev.length} results, right where you left off. Feel free to keep filtering or try a different search.`,
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
  };

  // Handle reset
  const handleReset = useCallback(() => {
    resetConversation();
    if (firstAlgoliaProducts.length > 0) {
      setAlgoliaProducts(firstAlgoliaProducts);
    }
  }, [resetConversation, firstAlgoliaProducts, setAlgoliaProducts]);

  // Handle image upload from chat — Gemini-first refinement
  // Instead of immediately calling the API, we ask Gemini to filter current results
  // based on the uploaded image, then offer a "Search catalog" button for API search.
  const handleImageUpload = async (file: File) => {
    const store = useConversationStore.getState();
    const imageUrl = URL.createObjectURL(file);

    // Show uploaded image in chat (small thumbnail)
    store.addMessage({
      role: 'user',
      content: 'Uploaded an image to refine search',
      imageUrl,
    });

    store.setIsLoading(true);
    // Store file for potential deferred catalog search
    store.setPendingCatalogImage(file);

    try {
      const geminiKey =
        geminiApiKey || (window as any).settings?.smartFilters?.geminiApiKey;
      const currentProducts = [...activeProducts];

      // If no products or no API key, skip refinement → offer direct catalog search
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

      // Encode both images in parallel (saves 200-400ms vs sequential)
      const [newBase64, origBase64] = await Promise.all([
        new Promise<string>(resolve => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve((reader.result as string).split(',')[1] || '');
          reader.readAsDataURL(file);
        }),
        requestImages[0]
          ? Promise.resolve(
              requestImages[0].toDataURL('image/jpeg', 0.7).split(',')[1] || '',
            )
          : Promise.resolve(''),
      ]);

      // Build product metadata for Gemini
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

      // Build Gemini request — send both images + product list
      const parts: any[] = [];
      if (origBase64) {
        parts.push({
          inlineData: { mimeType: 'image/jpeg', data: origBase64 },
        });
      }
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: newBase64 } });
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

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 8192,
              responseMimeType: 'application/json',
            },
          }),
        },
      );
      const data = await res.json();
      const responseText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('[Chat] Image refinement response:', responseText);

      const parsed = JSON.parse(responseText);
      const matchedIndices: number[] = parsed.matched_indices || [];
      const geminiMessage: string = parsed.message || '';

      const setProducts = isAlgoliaEnabled
        ? setAlgoliaProducts
        : productsFromAlgolia.length > 0
          ? setAlgoliaProducts
          : setFindApiProducts;

      if (matchedIndices.length > 0) {
        // Filter current products by Gemini's matched indices
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
        // No matches in current results
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
      console.error('[Chat] Image refinement failed:', err);
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
  };

  // Handle deferred catalog search with image (called when user clicks "Search catalog with this image")
  const handleCatalogSearchWithImage = async () => {
    const store = useConversationStore.getState();
    const file = store.pendingCatalogImage;
    if (!file) return;

    store.setIsLoading(true);
    try {
      const settings = (window as any).settings;
      const nyrisKey = settings?.apiKey || settings?.nyrisApiKey;
      const baseUrl = settings?.baseUrl || 'https://api.nyris.io';

      // Save current results so user can go back
      store.setPreCatalogResults([...activeProducts]);

      const formData = new FormData();
      formData.append('image', file);
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
      console.log('[Chat] Catalog image search:', results.length, 'results');

      const setProducts = isAlgoliaEnabled
        ? setAlgoliaProducts
        : productsFromAlgolia.length > 0
          ? setAlgoliaProducts
          : setFindApiProducts;

      if (results.length > 0) {
        // Replace results entirely with catalog search results
        setProducts(results);
        setFullResultPool(results);
        store.addMessage({
          role: 'assistant',
          content: `Great news! I found ${results.length} result${results.length === 1 ? '' : 's'} from the full catalog. I've updated your results with these new finds. You can always go back to what you had before.`,
          options: [
            {
              label: 'Go back to previous results',
              action_type: 'restore_previous' as const,
              key: 'restore',
              value: 'restore',
            },
          ],
        });
      } else {
        // Restore previous results since catalog returned nothing
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
      console.error('[Chat] Catalog image search failed:', err);
      // Restore on error
      const prev = store.preCatalogResults;
      if (prev) {
        const setProducts = isAlgoliaEnabled
          ? setAlgoliaProducts
          : productsFromAlgolia.length > 0
            ? setAlgoliaProducts
            : setFindApiProducts;
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
    }
  };

  // Handle deferred catalog search with text (called when user clicks "Search full catalog")
  const handleCatalogSearchWithText = async () => {
    const store = useConversationStore.getState();
    const text = store.pendingCatalogText;
    if (!text) return;

    store.setIsLoading(true);
    try {
      const settings = (window as any).settings;
      const nyrisKey = settings?.apiKey || settings?.nyrisApiKey;
      const baseUrl = settings?.baseUrl || 'https://api.nyris.io';

      // Save current results so user can go back
      store.setPreCatalogResults([...activeProducts]);

      const formData = new FormData();
      formData.append('text', text);
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
      console.log(
        '[Chat] Catalog text search:',
        results.length,
        'results for query:',
        text,
      );

      const setProducts = isAlgoliaEnabled
        ? setAlgoliaProducts
        : productsFromAlgolia.length > 0
          ? setAlgoliaProducts
          : setFindApiProducts;

      if (results.length > 0) {
        // Replace results entirely with catalog search results
        setProducts(results);
        setFullResultPool(results);
        store.addMessage({
          role: 'assistant',
          content: `I searched the full catalog for "${text}" and found ${results.length} result${results.length === 1 ? '' : 's'}. I've updated your view with these new results. You can always switch back to what you had before.`,
          options: [
            {
              label: 'Go back to previous results',
              action_type: 'restore_previous' as const,
              key: 'restore',
              value: 'restore',
            },
          ],
        });
      } else {
        // Restore previous results since catalog returned nothing
        const prev = store.preCatalogResults;
        if (prev) {
          setProducts(prev);
          setFullResultPool(prev);
        }
        store.setPreCatalogResults(null);
        store.addMessage({
          role: 'assistant',
          content: `I couldn't find anything matching "${text}" in the catalog. I've brought back your previous results so you can keep exploring.`,
        });
      }
    } catch (err: any) {
      console.error('[Chat] Catalog text search failed:', err);
      // Restore on error
      const prev = store.preCatalogResults;
      if (prev) {
        const setProducts = isAlgoliaEnabled
          ? setAlgoliaProducts
          : productsFromAlgolia.length > 0
            ? setAlgoliaProducts
            : setFindApiProducts;
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
      store.setPendingCatalogText(null);
      store.setIsLoading(false);
    }
  };

  // Get route badge — shown inside header
  const getRouteBadge = () => {
    if (!isEvaluated) return null;
    if (route === 'P3') {
      return (
        <span className="px-1.5 py-0.5 bg-white/20 text-white text-[10px] font-medium rounded">
          Good Match
        </span>
      );
    }
    if (route === 'P5') {
      return (
        <span className="px-1.5 py-0.5 bg-white/20 text-white text-[10px] font-medium rounded">
          Recovery {attemptCounter}/3
        </span>
      );
    }
    return null;
  };

  return (
    <div
      className={twMerge([
        'w-full h-full rounded-[24px] relative shadow-outer overflow-hidden',
        'flex flex-col',
        'p-[8px]',
        'border border-solid border-[#DDDEE7]',
      ])}
      style={{
        background: 'linear-gradient(#F3F4F8, #E4E3FF)',
      }}
    >
      {/* ── Header ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-[#3E36DC] text-white rounded-[24px]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <Sparkles size={14} className="text-white" />
          </div>
          <div>
            <p className="text-base font-bold leading-tight tracking-tight">
              <span className="opacity-80 font-normal">Vizo</span> Search
              Assistant
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
          title="Close assistant"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Warnings ── */}
      {!hasApiKey && (
        <div className="flex-shrink-0 mx-3 mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-[11px] text-amber-700">
            Gemini API key required.{' '}
            <button
              onClick={() => setShowAdminSettings(true)}
              className="underline font-semibold"
            >
              Configure
            </button>
          </p>
        </div>
      )}

      {error && (
        <div className="flex-shrink-0 mx-3 mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
          <p className="text-[11px] text-red-700">{error}</p>
        </div>
      )}

      {/* ── Messages ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-10">
            <div className="w-12 h-12 rounded-full bg-[#F0EFFF] flex items-center justify-center mb-3">
              <Sparkles size={20} className="text-[#3E36DC]" />
            </div>
            <p className="text-sm font-semibold text-[#2B2C46] mb-1">
              {hasApiKey ? 'Vizo Search Assistant' : 'API Key Required'}
            </p>
            <p className="text-[11px] text-[#999] leading-relaxed max-w-[200px]">
              {hasApiKey
                ? 'Upload an image to get started, or search for a product'
                : 'Configure your Gemini API key in settings to use the assistant'}
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={msg.id || i}
              className={twMerge(
                'flex',
                msg.role === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              <div className="max-w-[88%]">
                {/* Bubble */}
                <div
                  className={twMerge(
                    'px-3 py-2.5 text-xs leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-[#3E36DC] text-white rounded-2xl rounded-br-sm'
                      : msg.content.startsWith('[P7')
                        ? 'bg-[#EEF2FF] border border-[#C7D2FE] text-[#2B2C46] rounded-2xl rounded-bl-sm'
                        : 'bg-[#F3F3F5] text-[#2B2C46] rounded-2xl rounded-bl-sm',
                  )}
                >
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="Uploaded"
                      className="w-[48px] h-[48px] rounded-lg object-cover mb-2"
                    />
                  )}
                  {msg.content.startsWith('[P7') && (
                    <div className="flex items-center gap-1 mb-1.5 text-indigo-600 font-semibold text-[10px]">
                      <Globe size={10} /> Google Grounding
                    </div>
                  )}
                  <pre className="whitespace-pre-wrap font-sans text-xs">
                    {msg.content.startsWith('[P7')
                      ? msg.content.replace(/^\[P7[^\]]*\]\s*/, '')
                      : msg.content}
                  </pre>
                </div>

                {/* Quick reply options */}
                {msg.role === 'assistant' &&
                  msg.options &&
                  msg.options.length > 0 && (
                    <div className="mt-2 space-y-2.5">
                      {/* Option chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {msg.options
                          .filter(o => o.action_type !== 'text_search_prompt')
                          .map((option, optIdx) => (
                            <button
                              key={optIdx}
                              onClick={() => handleOptionClick(option)}
                              disabled={isLoading}
                              className={twMerge(
                                'px-2.5 py-1.5 text-[10px] font-medium rounded-full',
                                option.action_type === 'catalog_search_image' ||
                                  option.action_type ===
                                    'catalog_search_text' ||
                                  option.action_type === 'restore_previous'
                                  ? 'bg-white border border-[#3E36DC] text-[#3E36DC] hover:bg-[#F0EFFF]'
                                  : 'border border-[#3E36DC] text-[#3E36DC] hover:bg-[#3E36DC] hover:text-white',
                                'transition-colors',
                                isLoading && 'opacity-50 cursor-not-allowed',
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F3F3F5] rounded-2xl rounded-bl-sm">
              <Loader2 size={12} className="animate-spin text-[#3E36DC]" />
              <span className="text-xs text-[#666]">
                {!isEvaluated ? 'Analyzing results...' : 'Thinking...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── P7 Grounding status strip ── */}
      {(p7Running || p7Done) && (
        <div className="flex-shrink-0 px-3 py-1.5 border-t border-[#E0E0E0] bg-[#F8F8FF]">
          {p7Running ? (
            <span className="flex items-center gap-1.5 text-[10px] text-blue-600">
              <Globe size={10} className="animate-pulse" /> Running Google
              Grounding...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[10px] text-blue-500">
              <Globe size={10} /> Google Grounding complete
            </span>
          )}
        </div>
      )}

      {/* ── Upload image — fixed above input ── */}
      {/* {isEvaluated && hasApiKey && (
        <div className="flex-shrink-0 flex gap-2 px-3 py-2 border-t border-[#E0E0E0] bg-[#FAFAFF] rounded-3xl">
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={isLoading}
            className={twMerge(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2',
              'text-[11px] font-medium rounded-lg',
              'bg-[#3E36DC] text-white',
              'hover:bg-[#332CB7] transition-colors shadow-sm',
              isLoading && 'opacity-50 cursor-not-allowed',
            )}
          >
            <Camera size={12} />
            <span>Upload image</span>
          </button>
        </div>
      )} */}

      {/* ── Input ── */}
      {/* <div className="flex-shrink-0 px-3 py-3 border-t border-[#E0E0E0] bg-white rounded-3xl mt-2">
      </div> */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2 items-end"
      >
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={
            !hasApiKey
              ? 'Configure API key first...'
              : isLoading
                ? 'Please wait...'
                : 'Ask about the results...'
          }
          disabled={!hasApiKey || isLoading}
          rows={1}
          className={twMerge(
            'flex-1 resize-none rounded-xl px-3 py-2.5 text-xs',
            'border-2 border-[#3E36DC] outline-none',
            'bg-white disabled:opacity-60',
            'min-h-[40px] max-h-[100px]',
            'rounded-[32px]',
          )}
          style={{ fontFamily: 'inherit', lineHeight: '1.4' }}
        />

        {/* Hidden file input — triggered by Upload image button above */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              handleImageUpload(file);
              e.target.value = '';
            }
          }}
        />

        <button
          type="submit"
          disabled={isLoading || !inputValue.trim() || !hasApiKey}
          className={twMerge(
            'p-2.5 rounded-[32px] transition-colors flex-shrink-0',
            inputValue.trim() && !isLoading && hasApiKey
              ? 'bg-[#3E36DC] text-white hover:bg-[#332CB7]'
              : 'bg-[#E0E0E0] text-[#999] cursor-not-allowed',
          )}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

export default memo(ChatAssistant);
