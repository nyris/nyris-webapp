import { Region, RectCoords, Code } from '@nyris/nyris-api';
import { CanvasWithId } from 'types';

export interface CategoryPrediction {
  name: string;
  score: number;
}

export interface SearchState {
  results: any[];
  duration?: number;
  requestId?: string;
  sessionId?: string;
  regions: Region[];
  selectedRegion?: RectCoords;
  fetchingRegions: boolean;
  fetchingResults: boolean;
  filterOptions: string[];
  requestImage?: CanvasWithId | undefined;
  categoryPredictions: CategoryPrediction[];
  codes: Code[];
  errorMessage: string;
  valueTextSearch: any;
  resultSearchText: any[];
  filters: any[];
  configureFilter?: any;
  loadingSearchAlgolia: boolean;
  imageThumbSearchInput?: any;
  textSearchInputMobile?: string;
  isShowModalDetailItemMobile?: boolean;
  keyFilter?: string;
  preFilterDropdown?: boolean;
  setPreFilterDropdown?: any;
}
