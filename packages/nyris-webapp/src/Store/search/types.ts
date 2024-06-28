import { Region, RectCoords, Code } from '@nyris/nyris-api';
import { CanvasWithId } from 'types';

export interface CategoryPrediction {
  name: string;
  score: number;
}

export interface SearchState {
  categoryPredictions: CategoryPrediction[];
  codes: Code[];
  duration?: number;
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
  selectedRegion?: RectCoords;
  sessionId?: string;
  queryText?: string;
  setPreFilterDropdown?: any;
  textSearchInputMobile?: string;
  valueTextSearch: any;
  postFilter: Record<string, Record<string, boolean>>;
  showFeedback?: boolean;
  firstSearchImage: any;
  firstSearchResults: any;
  firstSearchPrefilters: any;
  firstSearchThumbSearchInput: any;
  countOfSearch: number;
}
