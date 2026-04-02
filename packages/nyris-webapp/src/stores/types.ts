import { Filter, RectCoords, Region } from '@nyris/nyris-api';

export interface RequestImageState {
  requestImages: HTMLCanvasElement[];
  regions: RectCoords[];
  firstSearchImage: HTMLCanvasElement | undefined;
}

export interface RequestImageAction {
  addRequestImage: (image: HTMLCanvasElement) => void;
  setRequestImages: (images: HTMLCanvasElement[]) => void;
  setFirstSearchImage: (image: HTMLCanvasElement) => void;
  updateRegion: (r: RectCoords, index: number) => void;
  setRegions: (r: RectCoords[]) => void;
  removeImage: (index: number) => void;
  resetRegions: () => void;
}

export interface QueryState {
  query?: string;
  valueInput?: string;
}

export interface QueryAction {
  setQuery: (query: string) => void;
  setValueInput: (value: string) => void;
}

export interface LoadingState {
  isFindApiLoading: boolean;
  isAlgoliaLoading: boolean;
  isCadenasLoaded: boolean;
  isGoogleGroundingLoading: boolean;
}

export interface AiUiState {
  isAiModeOpen: boolean;
}

export interface AiUiAction {
  setIsAiModeOpen: (isOpen: boolean) => void;
  toggleAiMode: () => void;
}

export interface LoadingAction {
  setIsFindApiLoading: (isLoading: boolean) => void;
  setIsAlgoliaLoading: (isLoading: boolean) => void;
  setIsCadenasLoaded: (isLoading: boolean) => void;
  setIsGoogleGroundingLoading: (isLoading: boolean) => void;
}

export interface ProductsState {
  productsFromFindApi: any[];
  productsFromAlgolia: any[];
  firstSearchResults: any[];
  imageAnalysis: {
    imageDescription: string;
    optimizedSearchQuery: string;
    specification: Record<string, string>;
  };
  firstRequestImageAnalysis: {
    imageDescription: string;
    optimizedSearchQuery: string;
    specification: Record<string, string>;
  };

  specificationFilteredProducts: any[];
  googleGroundingResponse: Record<string, any> | null;
  groundingFilterResult: any[];
  showingGroundingFilterResult: boolean;
  firstAlgoliaProducts: any[];
  fullResultPool: any[];
  smartFilters: {
    status: 'idle' | 'loading' | 'success' | 'error';
    filters: Array<{
      key: string;
      label: string;
      value: string;
      selected?: boolean;
    }>;
    selectedFilterKey: string | null;
    selectedFilterValue: string | null;
    rerankedSkus: string[];
    rerankStatus: 'idle' | 'loading' | 'success' | 'error';
    errorMessage: string | null;
    infoMessage: string | null;
  };
}

export interface ProductsAction {
  setFindApiProducts: (products: any[]) => void;
  setAlgoliaProducts: (products: any[]) => void;
  setFirstSearchResults: (products: any[]) => void;
  setImageAnalysis: (analysis: any) => void;
  setFirstRequestImageAnalysis: (analysis: {
    imageDescription: string;
    optimizedSearchQuery: string;
    specification: Record<string, string>;
  }) => void;
  setSpecificationFilteredProducts: (products: any[]) => void;
  setGoogleGroundingResponse: (result: any | null) => void;
  setGroundingFilterResult: (result: any[]) => void;
  setShowingGroundingFilterResult: (val?: boolean) => void;
  setFirstAlgoliaProducts: (products: any[]) => void;
  setFullResultPool: (products: any[]) => void;
  setSmartFilters: (smartFilters: ProductsState['smartFilters']) => void;
}

export interface DetectedRegionsState {
  detectedRegions: Record<number, Region[]>;
}

export interface DetectedRegionsAction {
  setDetectedRegions: (region: Region[], index: number) => void;
}

export interface FilterState {
  preFilter: Record<string, boolean>;
  preFilterList: Filter[];
  algoliaFilter: string;
  firstSearchPreFilter: Record<string, boolean>;
  specificationFilter: Record<string, string>;
  postFilterSelections: Record<string, string[]>;
  preFilterLoading: boolean;
}

export interface FilterAction {
  setPreFilter: (query: Record<string, boolean>) => void;
  setPreFilterList: (any: Filter[]) => void;
  setFirstSearchPreFilter: (query: Record<string, boolean>) => void;
  setAlgoliaFilter: (query: string) => void;
  setSpecificationFilter: (query: Record<string, string>) => void;
  setPostFilterSelections: (filters: Record<string, string[]>) => void;
  togglePostFilterSelection: (attribute: string, value: string) => void;
  clearPostFilterSelections: () => void;
  setPreFilterLoading: (isLoading: boolean) => void;
}

export interface MiscState {
  metaFilter: string;
  groundingQuery: string;
}

export interface MiscAction {
  setMetaFilter: (filter: string) => void;
  setGroundingQuery: (query: string) => void;
}

export interface FeedbackState {
  showFeedback: boolean;
}

export interface FeedbackAction {
  setShowFeedback: (show: boolean) => void;
}

export interface SidePanelState {
  showSidePanel: boolean;
}

export interface SidePanelAction {
  setShowSidePanel: (show: boolean) => void;
}

export interface SessionState {
  requestId: string;
  sessionId: string;
}

export interface SessionAction {
  setSessionId: (sessionId: string) => void;
  setRequestId: (requestId: string) => void;
}

export interface SpecificationState {
  specifications: any;
  nameplateNotificationText: string;
  showLoading: boolean;
  nameplateImage: any;
  showNotMatchedError: boolean;
}

export interface SpecificationAction {
  setSpecifications: (specifications: any) => void;
  setNameplateNotificationText: (nameplateNotificationText: string) => void;
  setShowLoading: (show: boolean) => void;
  setNameplateImage: (nameplateImage: any) => void;
  setShowNotMatchedError: (showNotMatchedError: boolean) => void;
}
