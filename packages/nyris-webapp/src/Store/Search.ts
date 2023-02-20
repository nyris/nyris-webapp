import { Code, RectCoords, Region } from '@nyris/nyris-api';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CanvasWithId } from 'types';

interface CategoryPrediction {
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
  mobileDetailsPreview?: boolean;
}

// TODO: init state
const initialState: SearchState = {
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
  mobileDetailsPreview: false
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchResults: (state, data) => {
      const { payload } = data;
      const {
        results,
        requestId,
        categoryPredictions,
        codes,
        duration,
        filters,
      } = payload;

      return {
        ...state,
        filters,
        results,
        requestId,
        categoryPredictions,
        codes,
        duration,
        sessionId: state.sessionId || requestId,
        fetchingResults: false,
      };
    },

    setRegions: (state, data: PayloadAction<Region[]>) => ({
      ...state,
      regions: data.payload,
    }),

    setSelectedRegion: (
      state,
      data: PayloadAction<RectCoords | undefined>,
    ) => ({
      ...state,
      selectedRegion: data.payload,
    }),

    setRequestImage: (state, data: PayloadAction<any>) => ({
      ...state,
      requestImage: {
        canvas: data.payload,
        id: Math.random().toString(),
      },
    }),

    selectionChanged: (state, data: PayloadAction<RectCoords>) => {
      const { payload } = data;
      return {
        ...state,
        selectedRegion: payload,
      };
    },

    loadFileSelectRegion: (state, data: PayloadAction<any>) => {
      const { payload } = data;

      const { results, requestId, categoryPredictions, codes, duration } =
        payload;
      return {
        ...state,
        results,
        requestId,
        categoryPredictions,
        codes,
        duration,
        sessionId: state.sessionId || requestId,
        fetchingRegions: false,
      };
    },

    loadingActionResults: state => {
      return {
        ...state,
        fetchingResults: true,
      };
    },

    loadingActionRegions: state => {
      return {
        ...state,
        fetchingRegions: true,
      };
    },

    searchFileImageNonRegion: (state, data: PayloadAction<any>) => {
      const { payload } = data;
      const { results, requestId, duration, categoryPredictions, codes } =
        payload;
      return {
        ...state,
        results,
        requestId,
        duration,
        categoryPredictions,
        codes,
        fetchingResults: false,
      };
    },

    changeValueTextSearch: (state, data: PayloadAction<any>) => {
      const { payload } = data;
      return {
        ...state,
        valueTextSearch: payload,
      };
    },

    resultSearchText: (state, data: PayloadAction<any>) => {
      const { payload } = data;
      return {
        ...state,
        resultSearchText: payload,
      };
    },

    updateResults: (state, data: PayloadAction<any>) => {
      const { payload } = data;
      return {
        ...state,
        results: payload,
      };
    },

    reset: (state, data: PayloadAction<any>) => {
      return {
        results: [],
        regions: [],
        selectedRegion: { x1: 0.1, x2: 0.9, y1: 0.1, y2: 0.9 },
        requestImage: undefined,
        fetchingResults: false,
        fetchingRegions: false,
        filterOptions: [],
        categoryPredictions: [],
        codes: [],
        errorMessage: '',
        valueTextSearch: {},
        resultSearchText: [],
        filters: [],
        loadingSearchAlgolia: false,
        imageThumbSearchInput: '',
        textSearchInputMobile: '',
        isShowModalDetailItemMobile: false,
        keyFilter: '',
        preFilterDropdown: false,
        mobileDetailsPreview: false
      };
    },

    onResetRequestImage: (state, data: PayloadAction<any>) => {
      return {
        ...state,
        requestImage: undefined,
        imageThumbSearchInput: '',
        results: [],
        regions: [],
      };
    },

    configureFilter: (state, data: PayloadAction<any>) => {
      const { payload } = data;
      return {
        ...state,
        configureFilter: payload,
      };
    },

    setUpdateSession: (state, data: PayloadAction<string>) => {
      const { payload } = data;
      return {
        ...state,
        sessionId: payload,
      };
    },

    updateResultChangePosition: (state, data: PayloadAction<any>) => {
      const { payload } = data;
      const { results } = payload;
      return {
        ...state,
        fetchingResults: false,
        results,
      };
    },

    setError: (state, data: PayloadAction<string>) => {
      return {
        ...state,
        fetchingRegions: false,
        fetchingResults: false,
        errorMessage: data.payload,
      };
    },

    setImageSearchInput: (state, data: PayloadAction<string>) => {
      const { payload } = data;
      return {
        ...state,
        imageThumbSearchInput: payload,
      };
    },
    updateStatusLoading: (state, data: PayloadAction<any>) => {
      const { payload } = data;
      return {
        ...state,
        loadingSearchAlgolia: payload,
      };
    },
    updateValueTextSearchMobile: (state, data: PayloadAction<string>) => {
      const { payload } = data;
      return {
        ...state,
        textSearchInputMobile: payload,
      };
    },
    onToggleModalItemDetail: (state, data: PayloadAction<boolean>) => {
      const { payload } = data;
      console.log('payload', payload);

      return {
        ...state,
        isShowModalDetailItemMobile: payload,
      };
    },
    setUpdateKeyFilterDesktop: (state, data: PayloadAction<string>) => {
      const { payload } = data;
      return {
        ...state,
        keyFilter: payload,
      };
    },
    setPreFilterDropdown: (state, data: PayloadAction<boolean>) => {
      return {
        ...state,
        preFilterDropdown: data.payload,
      };
    },
    setMobileDetailsPreview: (state, data: PayloadAction<boolean>) => {
      return {
        ...state,
        mobileDetailsPreview: data.payload,
      };
    },
  },
});

export const {
  setSearchResults,
  selectionChanged,
  setRequestImage,
  loadFileSelectRegion,
  setRegions,
  setSelectedRegion,
  loadingActionResults,
  loadingActionRegions,
  searchFileImageNonRegion,
  changeValueTextSearch,
  resultSearchText,
  updateResults,
  reset,
  configureFilter,
  setUpdateSession,
  updateResultChangePosition,
  setError,
  setImageSearchInput,
  updateStatusLoading,
  updateValueTextSearchMobile,
  onToggleModalItemDetail,
  onResetRequestImage,
  setUpdateKeyFilterDesktop,
  setPreFilterDropdown,
  setMobileDetailsPreview
} = searchSlice.actions;
export default searchSlice.reducer;
