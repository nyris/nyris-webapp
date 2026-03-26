import { create } from 'zustand';

// Types for the conversation flow
export type ConversationRoute = 'pending' | 'P3' | 'P5';
export type ResultQuality = 'pending' | 'good' | 'bad';
export type FailureMode =
  | null
  | 'wrong_category'
  | 'not_in_catalog'
  | 'ocr_mismatch'
  | 'ambiguous_image'
  | 'full_machine'
  | 'multiple_objects';

export type ActionType =
  | 'filter_apply'
  | 'filter_remove'
  | 'filter_clear'
  | 'text_search'
  | 'catalog_search_image'
  | 'catalog_search_text'
  | 'none' // P3 actions
  | 'ask'
  | 'resurface'
  | 'reset'
  | 'exit'; // P5 actions

export interface QuickReplyOption {
  label: string;
  action_type:
    | 'filter'
    | 'compare'
    | 'identify'
    | 'clarify'
    | 'confirm'
    | 'text_search_prompt'
    | 'catalog_search_image'
    | 'catalog_search_text'
    | 'restore_original';
  value?: string;
  key?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  imageUrl?: string;
  action?: {
    type: ActionType;
    key?: string;
    value?: string;
    filtered_results?: number[];
  };
  options?: QuickReplyOption[];
}

export interface ActiveFilter {
  key: string;
  value: string;
}

interface ConversationState {
  // Session state
  sessionId: string;
  isEvaluated: boolean; // P2 has fired

  // Routing
  route: ConversationRoute;
  quality: ResultQuality;
  failureMode: FailureMode;

  // P5 recovery
  attemptCounter: number; // 1-3 for P5 recovery

  // Conversation
  messages: ChatMessage[];
  activeFilters: ActiveFilter[];

  // UI state
  isOpen: boolean;
  hasNotification: boolean; // Pulse badge on chat icon when new message arrives
  isLoading: boolean;
  error: string | null;

  // Opening message from P2
  openingMessage: string | null;
  openingOptions: QuickReplyOption[];

  // Description mode — set when user clicks "Describe what you're looking for"
  awaitingDescription: boolean;

  // Pending catalog search — stored for deferred API search after Gemini refinement
  pendingCatalogImage: File | string | null;
  pendingCatalogText: string | null;

  // Pre-catalog results — saved before catalog search so user can go back
  preCatalogResults: any[] | null;
}

interface ConversationActions {
  // Session management
  startNewSession: () => void;

  // P2 evaluation result
  setEvaluationResult: (
    quality: ResultQuality,
    route: ConversationRoute,
    failureMode: FailureMode,
    openingMessage: string,
    options: QuickReplyOption[],
  ) => void;

  // Messages
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;

  // Filters (for P3)
  addFilter: (key: string, value: string) => void;
  removeFilter: (key: string) => void;
  clearFilters: () => void;

  // P5 recovery
  incrementAttempt: () => void;

  // UI state
  setIsOpen: (isOpen: boolean) => void;
  clearNotification: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setAwaitingDescription: (awaiting: boolean) => void;
  setPendingCatalogImage: (file: File | string | null) => void;
  setPendingCatalogText: (text: string | null) => void;
  setPreCatalogResults: (results: any[] | null) => void;

  // Reset
  reset: () => void;
}

const generateId = () =>
  `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateSessionId = () =>
  `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const initialState: ConversationState = {
  sessionId: '',
  isEvaluated: false,
  route: 'pending',
  quality: 'pending',
  failureMode: null,
  attemptCounter: 0,
  messages: [],
  activeFilters: [],
  isOpen: false, // Start closed so left panel is open by default
  hasNotification: false,
  isLoading: false,
  error: null,
  openingMessage: null,
  openingOptions: [],
  awaitingDescription: false,
  pendingCatalogImage: null,
  pendingCatalogText: null,
  preCatalogResults: null,
};

const useConversationStore = create<ConversationState & ConversationActions>()(
  (set, get) => ({
    ...initialState,

    startNewSession: () =>
      set(state => ({
        ...initialState,
        isEvaluated: false,
        sessionId: generateSessionId(),
        isOpen: state.isOpen, // Preserve current open state across searches
      })),

    setEvaluationResult: (
      quality,
      route,
      failureMode,
      openingMessage,
      options,
    ) => {
      const state = get();

      // Only set if not already evaluated (P2 fires once)
      if (state.isEvaluated) return;

      set({
        isEvaluated: true,
        quality,
        route,
        failureMode,
        openingMessage,
        openingOptions: options,
        attemptCounter: route === 'P5' ? 1 : 0,
        isOpen: false, // Don't auto-open — show notification badge instead
        hasNotification: true,
      });

      // Add opening message to chat
      set(state => ({
        messages: [
          ...state.messages,
          {
            id: generateId(),
            role: 'assistant' as const,
            content: openingMessage,
            timestamp: Date.now(),
            options,
          },
        ],
      }));
    },

    addMessage: message =>
      set(state => ({
        messages: [
          ...state.messages,
          {
            ...message,
            id: generateId(),
            timestamp: Date.now(),
          },
        ],
      })),

    clearMessages: () => set({ messages: [] }),

    addFilter: (key, value) =>
      set(state => ({
        activeFilters: [
          ...state.activeFilters.filter(f => f.key !== key),
          { key, value },
        ],
      })),

    removeFilter: key =>
      set(state => ({
        activeFilters: state.activeFilters.filter(f => f.key !== key),
      })),

    clearFilters: () => set({ activeFilters: [] }),

    incrementAttempt: () =>
      set(state => ({
        attemptCounter: Math.min(state.attemptCounter + 1, 3),
      })),

    setIsOpen: isOpen =>
      set({ isOpen, ...(isOpen ? { hasNotification: false } : {}) }),
    clearNotification: () => set({ hasNotification: false }),
    setIsLoading: isLoading => set({ isLoading }),
    setError: error => set({ error }),
    setAwaitingDescription: awaiting => set({ awaitingDescription: awaiting }),
    setPendingCatalogImage: file => set({ pendingCatalogImage: file }),
    setPendingCatalogText: text => set({ pendingCatalogText: text }),
    setPreCatalogResults: results => set({ preCatalogResults: results }),

    reset: () =>
      set({
        ...initialState,
        sessionId: generateSessionId(),
      }),
  }),
);

export default useConversationStore;
