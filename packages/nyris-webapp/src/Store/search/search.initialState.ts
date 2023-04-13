import { SearchState } from './types';

export const initialState: SearchState = {
  results: [],
  regions: [],
  selectedRegion: undefined,
  requestImage: undefined,
  fetchingResults: false,
  fetchingRegions: false,
  filterOptions: [],
  categoryPredictions: [],
  codes: [],
  errorMessage: '',
  valueTextSearch: {
    configure: { filters: '' },
    page: 1,
    refinementList: '',
  },
  resultSearchText: [],
  filters: [],
  configureFilter: {},
  loadingSearchAlgolia: false,
  imageThumbSearchInput: '',
  textSearchInputMobile: '',
  isShowModalDetailItemMobile: false,
  keyFilter: '',
  preFilterDropdown: false,
};
