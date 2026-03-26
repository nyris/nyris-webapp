import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OrganizationProfile, DEFAULT_ORG_PROFILE } from './organizationProfile';

export interface SmartFilter {
  id: string;
  label: string;
  value: string;
  type: 'ai-generated';
}

export interface RerankedResult {
  sku: string;
  score: number;
  reasoning: string;
  matchedFilters: string[];
  originalRank: number;
  currentRank: number;
}

interface SmartFiltersState {
  // API Keys (persisted in localStorage for admin convenience)
  nyrisApiKeyOverride: string; // Override for nyris API key (empty = use settings.js)
  geminiApiKey: string;
  geminiModel: string; // 'gemini-3.1-flash-lite-preview'
  filterPrompt: string;
  rerankPrompt: string;
  
  // Settings
  includeReasoning: boolean; // Toggle for AI reasoning (slower but more informative)
  backgroundRemovalEnabled: boolean; // Toggle for rembg background removal
  backgroundRemovalModel: string; // rembg model to use
  sam3Enabled: boolean; // Toggle for SAM 3 segmentation
  sam3ServerUrl: string; // SAM 3 server URL (ngrok/remote)
  sam3SegmentOnClickOnly: boolean; // When true: search on upload, segment only when user clicks
  chatWithDbEnabled: boolean; // P6: extract filters from product description, query full index / MongoDB
  chatWithDbApiUrl: string; // Backend API URL for Chat with DB (MongoDB etc.)
  googleGroundingEnabled: boolean; // P7: validate bad results via Google Search
  visualRerankEnabled: boolean; // Visual reranking: 1:1 image comparison with Gemini
  showFilterChips: boolean; // Toggle visibility of Smart Filter chips (independent of Chat Assistant)

  // Organization profile for dynamic prompt tailoring
  orgProfile: OrganizationProfile;

  // Filters
  filters: SmartFilter[];
  selectedFilters: SmartFilter[];
  
  // Reranking (Smart Filters)
  rerankedResults: RerankedResult[];
  originalRankings: Record<string, number>;
  isReranked: boolean;
  
  // Visual Reranking state
  isVisualReranked: boolean;
  isVisualReranking: boolean;
  visualRerankRankings: Record<string, { originalRank: number; newRank: number; score: number; reasoning: string }>;
  
  // Loading states
  isGeneratingFilters: boolean;
  isReranking: boolean;
  
  // Error
  error: string | null;
  
  // Admin settings modal
  showAdminSettings: boolean;
}

interface SmartFiltersActions {
  // API Key actions
  setNyrisApiKeyOverride: (key: string) => void;
  setGeminiApiKey: (key: string) => void;
  setGeminiModel: (model: string) => void;
  setFilterPrompt: (prompt: string) => void;
  setRerankPrompt: (prompt: string) => void;
  
  // Settings
  setIncludeReasoning: (include: boolean) => void;
  setBackgroundRemovalEnabled: (enabled: boolean) => void;
  setBackgroundRemovalModel: (model: string) => void;
  setSam3Enabled: (enabled: boolean) => void;
  setSam3ServerUrl: (url: string) => void;
  setSam3SegmentOnClickOnly: (onClickOnly: boolean) => void;
  setChatWithDbEnabled: (enabled: boolean) => void;
  setChatWithDbApiUrl: (url: string) => void;
  setGoogleGroundingEnabled: (enabled: boolean) => void;
  setVisualRerankEnabled: (enabled: boolean) => void;
  setShowFilterChips: (show: boolean) => void;

  // Organization profile
  setOrgProfile: (profile: OrganizationProfile) => void;

  // Filter actions
  setFilters: (filters: SmartFilter[]) => void;
  toggleFilter: (filter: SmartFilter) => void;
  clearSelectedFilters: () => void;
  
  // Reranking actions (Smart Filters)
  setRerankedResults: (results: RerankedResult[]) => void;
  setOriginalRankings: (rankings: Record<string, number>) => void;
  setIsReranked: (isReranked: boolean) => void;
  clearReranking: () => void;
  
  // Visual Reranking actions
  setIsVisualReranked: (isReranked: boolean) => void;
  setIsVisualReranking: (loading: boolean) => void;
  setVisualRerankRankings: (rankings: Record<string, { originalRank: number; newRank: number; score: number; reasoning: string }>) => void;
  clearVisualReranking: () => void;
  
  // Loading states
  setIsGeneratingFilters: (loading: boolean) => void;
  setIsReranking: (loading: boolean) => void;
  
  // Error
  setError: (error: string | null) => void;
  
  // Admin settings
  setShowAdminSettings: (show: boolean) => void;
  
  // Reset
  reset: () => void;
}

const getDefaultPrompts = () => {
  const settings = (window as any).settings;
  return {
    filterPrompt: settings?.smartFilters?.filterPrompt || '',
    rerankPrompt: settings?.smartFilters?.rerankPrompt || '',
  };
};

// Default Gemini API key — hardcoded for ease of use
const DEFAULT_GEMINI_KEY = 'AIzaSyC41LvDmZHVbRMlsEO1IaTdxYekYtOF4Ww';

const initialState: SmartFiltersState = {
  nyrisApiKeyOverride: '',
  geminiApiKey: DEFAULT_GEMINI_KEY,
  geminiModel: 'gemini-3.1-flash-lite-preview',
  filterPrompt: '',
  rerankPrompt: '',
  includeReasoning: false, // Default: off for faster filtering
  backgroundRemovalEnabled: false, // Default: off (needs rembg server)
  backgroundRemovalModel: 'isnet-general-use', // Default model
  sam3Enabled: false, // Default: off (needs server setup)
  sam3ServerUrl: '', // No default - user must configure
  sam3SegmentOnClickOnly: true, // Search first, segment only on click
  chatWithDbEnabled: true, // P6 enabled by default
  chatWithDbApiUrl: '', // No default - use Algolia fallback until backend is configured
  googleGroundingEnabled: false, // P7 off by default
  visualRerankEnabled: false, // Visual reranking off by default
  showFilterChips: false, // Smart Filter chips hidden by default
  orgProfile: DEFAULT_ORG_PROFILE,
  filters: [],
  selectedFilters: [],
  rerankedResults: [],
  originalRankings: {},
  isReranked: false,
  isVisualReranked: false,
  isVisualReranking: false,
  visualRerankRankings: {},
  isGeneratingFilters: false,
  isReranking: false,
  error: null,
  showAdminSettings: false,
};

const useSmartFiltersStore = create<SmartFiltersState & SmartFiltersActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Initialize prompts from settings on first load
      filterPrompt: getDefaultPrompts().filterPrompt,
      rerankPrompt: getDefaultPrompts().rerankPrompt,
      
      setNyrisApiKeyOverride: (key) => set({ nyrisApiKeyOverride: key }),
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      setGeminiModel: (model) => set({ geminiModel: model }),
      setFilterPrompt: (prompt) => set({ filterPrompt: prompt }),
      setRerankPrompt: (prompt) => set({ rerankPrompt: prompt }),
      setIncludeReasoning: (include) => set({ includeReasoning: include }),
      setBackgroundRemovalEnabled: (enabled) => set({ backgroundRemovalEnabled: enabled }),
      setBackgroundRemovalModel: (model) => set({ backgroundRemovalModel: model }),
      setSam3Enabled: (enabled) => set({ sam3Enabled: enabled }),
      setSam3ServerUrl: (url) => set({ sam3ServerUrl: url }),
      setSam3SegmentOnClickOnly: (onClickOnly) => set({ sam3SegmentOnClickOnly: onClickOnly }),
      setChatWithDbEnabled: (enabled) => set({ chatWithDbEnabled: enabled }),
      setChatWithDbApiUrl: (url) => set({ chatWithDbApiUrl: url }),
      setGoogleGroundingEnabled: (enabled) => set({ googleGroundingEnabled: enabled }),
      setVisualRerankEnabled: (enabled) => set({ visualRerankEnabled: enabled }),
      setShowFilterChips: (show) => set({ showFilterChips: show }),
      setOrgProfile: (profile) => set({ orgProfile: profile }),

      setFilters: (filters) => set({ filters }),
      
      toggleFilter: (filter) => set((state) => {
        const isSelected = state.selectedFilters.some(f => f.id === filter.id);
        if (isSelected) {
          return { selectedFilters: state.selectedFilters.filter(f => f.id !== filter.id) };
        } else {
          return { selectedFilters: [...state.selectedFilters, filter] };
        }
      }),
      
      clearSelectedFilters: () => set({ 
        selectedFilters: [], 
        isReranked: false,
        rerankedResults: [],
      }),
      
      setRerankedResults: (results) => set({ rerankedResults: results }),
      setOriginalRankings: (rankings) => set({ originalRankings: rankings }),
      setIsReranked: (isReranked) => set({ isReranked }),
      
      clearReranking: () => set({
        rerankedResults: [],
        isReranked: false,
      }),
      
      setIsVisualReranked: (isReranked) => set({ isVisualReranked: isReranked }),
      setIsVisualReranking: (loading) => set({ isVisualReranking: loading }),
      setVisualRerankRankings: (rankings) => set({ visualRerankRankings: rankings }),
      clearVisualReranking: () => set({
        isVisualReranked: false,
        isVisualReranking: false,
        visualRerankRankings: {},
      }),
      
      setIsGeneratingFilters: (loading) => set({ isGeneratingFilters: loading }),
      setIsReranking: (loading) => set({ isReranking: loading }),
      
      setError: (error) => set({ error }),
      
      setShowAdminSettings: (show) => set({ showAdminSettings: show }),
      
      reset: () => set({
        filters: [],
        selectedFilters: [],
        rerankedResults: [],
        originalRankings: {},
        isReranked: false,
        isVisualReranked: false,
        isVisualReranking: false,
        visualRerankRankings: {},
        isGeneratingFilters: false,
        isReranking: false,
        error: null,
      }),
    }),
    {
      name: 'smart-filters-storage',
      version: 3,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Partial<SmartFiltersState>;
        if (version < 1) {
          if (!state.geminiModel || state.geminiModel === 'gemini-2.5-flash-lite') {
            state.geminiModel = 'gemini-3.1-flash-lite-preview';
          }
        }
        if (version < 2) {
          state.backgroundRemovalEnabled = false;
          state.googleGroundingEnabled = false;
          state.visualRerankEnabled = false;
          state.showFilterChips = false;
          state.sam3Enabled = false;
        }
        if (version < 3) {
          if (!state.geminiApiKey || state.geminiApiKey === 'AIzaSyC41LvDmZHVbRMlsEO1laTdxYekYtOQJDY') {
            state.geminiApiKey = 'AIzaSyC41LvDmZHVbRMlsEO1IaTdxYekYtOF4Ww';
          }
        }
        return state;
      },
      partialize: (state) => ({
        nyrisApiKeyOverride: state.nyrisApiKeyOverride,
        geminiApiKey: state.geminiApiKey,
        geminiModel: state.geminiModel,
        filterPrompt: state.filterPrompt,
        rerankPrompt: state.rerankPrompt,
        includeReasoning: state.includeReasoning,
        backgroundRemovalEnabled: state.backgroundRemovalEnabled,
        backgroundRemovalModel: state.backgroundRemovalModel,
        sam3Enabled: state.sam3Enabled,
        sam3ServerUrl: state.sam3ServerUrl,
        sam3SegmentOnClickOnly: state.sam3SegmentOnClickOnly,
        chatWithDbEnabled: state.chatWithDbEnabled,
        chatWithDbApiUrl: state.chatWithDbApiUrl,
        googleGroundingEnabled: state.googleGroundingEnabled,
        visualRerankEnabled: state.visualRerankEnabled,
        showFilterChips: state.showFilterChips,
        orgProfile: state.orgProfile,
      }),
    }
  )
);

export default useSmartFiltersStore;
