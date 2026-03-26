import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  // Context that was included with this message
  context?: {
    productSkus?: string[];
    imageDescription?: string;
    filters?: string[];
  };
}

export interface ProductContext {
  sku: string;
  title: string;
  description?: string;
  imageUrl?: string;
  attributes?: Record<string, string>;
}

interface ChatState {
  // Messages
  messages: ChatMessage[];
  
  // UI State
  isOpen: boolean;
  isLoading: boolean;
  isStreaming: boolean;
  
  // Error handling
  error: string | null;
  
  // Session
  conversationId: string;
}

interface ChatActions {
  // Message actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateLastAssistantMessage: (content: string) => void;
  clearMessages: () => void;
  
  // UI actions
  setIsOpen: (isOpen: boolean) => void;
  toggleOpen: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  
  // Error
  setError: (error: string | null) => void;
  
  // Session
  newConversation: () => void;
  
  // Reset
  reset: () => void;
}

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateConversationId = () => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const initialState: ChatState = {
  messages: [],
  isOpen: false,
  isLoading: false,
  isStreaming: false,
  error: null,
  conversationId: generateConversationId(),
};

const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      addMessage: (message) => set((state) => ({
        messages: [
          ...state.messages,
          {
            ...message,
            id: generateId(),
            timestamp: Date.now(),
          },
        ],
        error: null,
      })),
      
      updateLastAssistantMessage: (content) => set((state) => {
        const messages = [...state.messages];
        const lastIndex = messages.length - 1;
        
        if (lastIndex >= 0 && messages[lastIndex].role === 'assistant') {
          messages[lastIndex] = {
            ...messages[lastIndex],
            content,
          };
        }
        
        return { messages };
      }),
      
      clearMessages: () => set({ 
        messages: [],
        error: null,
      }),
      
      setIsOpen: (isOpen) => set({ isOpen }),
      
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
      
      setIsLoading: (isLoading) => set({ isLoading }),
      
      setIsStreaming: (isStreaming) => set({ isStreaming }),
      
      setError: (error) => set({ error, isLoading: false, isStreaming: false }),
      
      newConversation: () => set({
        messages: [],
        conversationId: generateConversationId(),
        error: null,
      }),
      
      reset: () => set({
        ...initialState,
        conversationId: generateConversationId(),
      }),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        // Only persist conversation history, not UI state
        messages: state.messages.slice(-50), // Keep last 50 messages
        conversationId: state.conversationId,
      }),
    }
  )
);

export default useChatStore;
