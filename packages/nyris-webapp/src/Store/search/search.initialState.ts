import { SearchState } from './types';

export const initialState: SearchState = {
  categoryPredictions: [],
  codes: [],
  fetchingResults: false,
  filterOptions: [],
  filters: [],

  isShowModalDetailItemMobile: false,
  preFilter: {},
  loadingSearchAlgolia: false,
  imageCaptureHelpModal: false,
  regions: [],
  requestImage: undefined,
  results: [],
  selectedRegion: undefined,
  valueTextSearch: {
    configure: { filters: '' },
    page: 1,
    refinementList: '',
  },
  postFilter: {},
  showFeedback: false,
  firstSearchImage: '',
  firstSearchResults: null,
  firstSearchPrefilters: null,
};
