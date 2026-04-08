import { useCallback, useRef } from 'react';
import useChatStore, {
  ChatMessage,
  ProductContext,
} from 'stores/chat/chatStore';
import useSmartFiltersStore from 'stores/smartFilters/smartFiltersStore';
import useResultStore from 'stores/result/resultStore';
import useRequestStore from 'stores/request/requestStore';

interface ChatContext {
  products: ProductContext[];
  imageDescription: string;
  imageSpecification: Record<string, string>;
  smartFilters: string[];
  query: string;
}

const getGeminiApiUrl = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

// Note: The actual system prompt is built dynamically using orgProfile.productDomain
// This constant is used as a fallback template
const SYSTEM_PROMPT_TEMPLATE = `You are a helpful product search assistant for a {{PRODUCT_DOMAIN}} search application. Your role is to help users find the right products and answer questions about the search results.

You have access to:
1. The current search results (products with their details)
2. Image analysis data (what was detected in the uploaded image)
3. Applied filters
4. The user's search query

Guidelines:
- Be concise and helpful
- Focus on the products and search context
- If asked about specific products, reference them by name or SKU
- Help users narrow down their search or understand product differences
- If you don't have enough information, ask clarifying questions
- Use markdown formatting for better readability (bullet points, bold for emphasis)
- When comparing products, use tables or structured lists
- Always be accurate - don't make up product details not in the context`;

export default function useChat() {
  const {
    messages,
    isLoading,
    isStreaming,
    error,
    addMessage,
    updateLastAssistantMessage,
    setIsLoading,
    setIsStreaming,
    setError,
    clearMessages,
    newConversation,
  } = useChatStore();

  const { geminiApiKey, geminiModel, orgProfile } = useSmartFiltersStore();

  // Abort controller for cancelling requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Get current context from stores
  const getContext = useCallback((): ChatContext => {
    const resultState = useResultStore.getState();
    const requestState = useRequestStore.getState();
    const smartFiltersState = useSmartFiltersStore.getState();

    // Get products from either Algolia or Find API
    const rawProducts =
      resultState.productsFromAlgolia.length > 0
        ? resultState.productsFromAlgolia
        : resultState.productsFromFindApi;

    // Transform to simplified context (limit to top 10 for context size)
    const products: ProductContext[] = rawProducts
      .slice(0, 10)
      .map((p: any) => ({
        sku: p.sku || p.objectID || 'Unknown',
        title:
          p.title ||
          p.name ||
          p[(window.settings as any)?.field?.productName] ||
          'Untitled',
        description:
          p.description ||
          p[(window.settings as any)?.field?.productDetails] ||
          '',
        imageUrl: p.main_image_link || p.image || '',
        attributes: {
          brand: p.brand || '',
          category: p.category || '',
          ...Object.fromEntries(
            Object.entries(p)
              .filter(
                ([key]) =>
                  ![
                    'sku',
                    'title',
                    'name',
                    'description',
                    'main_image_link',
                    'image',
                    'objectID',
                  ].includes(key),
              )
              .slice(0, 5), // Limit additional attributes
          ),
        },
      }));

    // Get image analysis
    const imageAnalysis = resultState.imageAnalysis;

    // Get selected smart filters
    const selectedFilters = smartFiltersState.selectedFilters.map(
      f => `${f.label}: ${f.value}`,
    );

    return {
      products,
      imageDescription: imageAnalysis?.imageDescription || '',
      imageSpecification: imageAnalysis?.specification || {},
      smartFilters: selectedFilters,
      query: requestState.query || '',
    };
  }, []);

  // Build the context message for the LLM
  const buildContextMessage = useCallback((context: ChatContext): string => {
    let contextParts: string[] = [];

    // Add search query if present
    if (context.query) {
      contextParts.push(`**Search Query:** "${context.query}"`);
    }

    // Add image analysis
    if (context.imageDescription) {
      contextParts.push(`**Image Description:** ${context.imageDescription}`);
    }

    if (Object.keys(context.imageSpecification).length > 0) {
      const specs = Object.entries(context.imageSpecification)
        .filter(([key]) => key !== 'is_nameplate' && key !== 'prefilter_value')
        .map(([key, value]) => `- ${key}: ${value}`)
        .join('\n');
      if (specs) {
        contextParts.push(`**Identified Attributes:**\n${specs}`);
      }
    }

    // Add active filters
    if (context.smartFilters.length > 0) {
      contextParts.push(
        `**Active Filters:** ${context.smartFilters.join(', ')}`,
      );
    }

    // Add products
    if (context.products.length > 0) {
      const productList = context.products
        .map((p, i) => {
          let productInfo = `${i + 1}. **${p.title}** (SKU: ${p.sku})`;
          if (p.description) {
            productInfo += `\n   ${p.description.substring(0, 150)}${p.description.length > 150 ? '...' : ''}`;
          }
          if (p.attributes?.brand) {
            productInfo += `\n   Brand: ${p.attributes.brand}`;
          }
          return productInfo;
        })
        .join('\n');
      contextParts.push(
        `**Current Search Results (${context.products.length} products):**\n${productList}`,
      );
    }

    return contextParts.join('\n\n');
  }, []);

  // Check if API key is configured
  const hasApiKey = useCallback(() => {
    return Boolean(geminiApiKey || process.env.REACT_APP_GEMINI_API_KEY);
  }, [geminiApiKey]);

  // Get the active API key
  const getApiKey = useCallback(() => {
    return geminiApiKey || process.env.REACT_APP_GEMINI_API_KEY || '';
  }, [geminiApiKey]);

  // Send a message
  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim()) return;

      const apiKey = getApiKey();
      if (!apiKey) {
        setError(
          'Gemini API key not configured. Please add it in Admin Settings.',
        );
        return;
      }

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Add user message
      const context = getContext();
      addMessage({
        role: 'user',
        content: userMessage,
        context: {
          productSkus: context.products.map(p => p.sku),
          imageDescription: context.imageDescription,
          filters: context.smartFilters,
        },
      });

      // Add placeholder for assistant message
      addMessage({
        role: 'assistant',
        content: '',
      });

      setIsLoading(true);
      setIsStreaming(true);
      setError(null);

      try {
        // Build conversation history for context
        const conversationHistory = messages.slice(-10).map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        // Build the request
        const contextMessage = buildContextMessage(context);

        const requestBody = {
          contents: [
            // System instruction as first user message
            {
              role: 'user',
              parts: [
                {
                  text: SYSTEM_PROMPT_TEMPLATE.replace(
                    '{{PRODUCT_DOMAIN}}',
                    orgProfile?.productDomain || 'products and components',
                  ),
                },
              ],
            },
            {
              role: 'model',
              parts: [
                {
                  text: "I understand. I'm ready to help with product search queries based on the context you provide.",
                },
              ],
            },
            // Context message
            {
              role: 'user',
              parts: [
                {
                  text: `Here is the current search context:\n\n${contextMessage}`,
                },
              ],
            },
            {
              role: 'model',
              parts: [
                {
                  text: "I've reviewed the search context. How can I help you with these results?",
                },
              ],
            },
            // Previous conversation
            ...conversationHistory,
            // Current user message
            {
              role: 'user',
              parts: [{ text: userMessage }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        };

        const response = await fetch(
          `${getGeminiApiUrl(geminiModel || 'gemini-2.5-flash-lite')}?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: abortControllerRef.current.signal,
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error?.message ||
              `API request failed: ${response.status}`,
          );
        }

        const data = await response.json();

        // Extract the response text
        const responseText =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Sorry, I couldn't generate a response.";

        updateLastAssistantMessage(responseText);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // Request was cancelled, don't show error
          return;
        }

        console.error('Chat error:', err);
        const errorMessage =
          err.message || 'Failed to get response. Please try again.';
        setError(errorMessage);
        updateLastAssistantMessage(
          'Oops, something went wrong on my end. Could you try that again?',
        );
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [
      messages,
      getApiKey,
      getContext,
      buildContextMessage,
      addMessage,
      updateLastAssistantMessage,
      setIsLoading,
      setIsStreaming,
      setError,
    ],
  );

  // Cancel ongoing request
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [setIsLoading, setIsStreaming]);

  // Start a new conversation
  const startNewConversation = useCallback(() => {
    cancelRequest();
    newConversation();
  }, [cancelRequest, newConversation]);

  return {
    // State
    messages,
    isLoading,
    isStreaming,
    error,
    hasApiKey: hasApiKey(),

    // Actions
    sendMessage,
    cancelRequest,
    clearMessages,
    startNewConversation,
  };
}
