import { RectCoords, Region } from '@nyris/nyris-api';

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
}

export interface LoadingAction {
  setIsFindApiLoading: (isLoading: boolean) => void;
  setIsAlgoliaLoading: (isLoading: boolean) => void;
  setIsCadenasLoaded: (isLoading: boolean) => void;
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
}

export interface DetectedRegionsState {
  detectedRegions: Record<number, Region[]>;
}

export interface DetectedRegionsAction {
  setDetectedRegions: (region: Region[], index: number) => void;
}

export interface FilterState {
  preFilter: Record<string, boolean>;
  algoliaFilter: string;
  firstSearchPreFilter: Record<string, boolean>;
  specificationFilter: Record<string, string>;
}

export interface FilterAction {
  setPreFilter: (query: Record<string, boolean>) => void;
  setFirstSearchPreFilter: (query: Record<string, boolean>) => void;
  setAlgoliaFilter: (query: string) => void;
  setSpecificationFilter: (query: Record<string, string>) => void;
}

export interface MiscState {
  metaFilter: string;
}

export interface MiscAction {
  setMetaFilter: (filter: string) => void;
}

export interface FeedbackState {
  showFeedback: boolean;
}

export interface FeedbackAction {
  setShowFeedback: (show: boolean) => void;
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
  specifications: any[];
  nameplate: any;
}

export interface SpecificationAction {
  setSpecifications: (specifications: any[]) => void;
  setNameplate: (nameplate: any[]) => void;
}
