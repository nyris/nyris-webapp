import { RectCoords, Region } from '@nyris/nyris-api';

export interface RequestImageState {
  requestImages: HTMLCanvasElement[];
  regions: RectCoords[];
}

export interface RequestImageAction {
  addRequestImage: (image: HTMLCanvasElement) => void;
  setRequestImages: (images: HTMLCanvasElement[]) => void;
  updateRegion: (r: RectCoords, index: number) => void;
  setRegions: (r: RectCoords[]) => void;
  removeImage: (index: number) => void;
  resetRegions: () => void;
}

export interface QueryState {
  query?: string;
}

export interface QueryAction {
  setQuery: (query: string) => void;
}

export interface LoadingState {
  isFindApiLoading: boolean;
  isAlgoliaLoading: boolean;
}

export interface LoadingAction {
  setIsFindApiLoading: (isLoading: boolean) => void;
  setIsAlgoliaLoading: (isLoading: boolean) => void;
}

export interface ProductsState {
  productsFromFindApi: any[];
  productsFromAlgolia: any[];
}

export interface ProductsAction {
  setFindApiProducts: (products: any[]) => void;
  setAlgoliaProducts: (products: any[]) => void;
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
}

export interface FilterAction {
  setPreFilter: (query: Record<string, boolean>) => void;
  setAlgoliaFilter: (query: string) => void;
}
