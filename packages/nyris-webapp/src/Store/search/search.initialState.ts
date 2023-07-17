import { SearchState } from './types';

export const initialState: SearchState = {
  categoryPredictions: [],
  codes: [],
  configureFilter: {},
  errorMessage: '',
  fetchingRegions: false,
  fetchingResults: false,
  filterOptions: [],
  filters: [],
  imageThumbSearchInput: '',
  isShowModalDetailItemMobile: false,
  keyFilter: '',
  loadingSearchAlgolia: false,
  preFilterDropdown: false,
  imageCaptureHelpModal: false,
  regions: [],
  requestImage: undefined,
  results: [],
  resultSearchText: [],
  selectedRegion: undefined,
  textSearchInputMobile: '',
  valueTextSearch: {
    configure: { filters: '' },
    page: 1,
    refinementList: '',
  },
};
