import { Region, RectCoords, Code } from '@nyris/nyris-api';
import { CanvasWithId } from 'types';

export interface CategoryPrediction {
  name: string;
  score: number;
}

export interface SearchState {
  categoryPredictions: CategoryPrediction[];
  codes: Code[];
  configureFilter?: any;
  duration?: number;
  errorMessage: string;
  fetchingRegions: boolean;
  fetchingResults: boolean;
  filterOptions: string[];
  filters: any[];
  imageThumbSearchInput?: any;
  isShowModalDetailItemMobile?: boolean;
  preFilter: Record<string, boolean>;
  loadingSearchAlgolia: boolean;
  preFilterDropdown?: boolean;
  imageCaptureHelpModal?: boolean;
  regions: Region[];
  requestId?: string;
  requestImage?: CanvasWithId | undefined;
  results: any[];
  resultSearchText: any[];
  selectedRegion?: RectCoords;
  sessionId?: string;
  queryText?: string;
  setPreFilterDropdown?: any;
  textSearchInputMobile?: string;
  valueTextSearch: any;
  postFilter: Record<string, Record<string, boolean>>;
}
