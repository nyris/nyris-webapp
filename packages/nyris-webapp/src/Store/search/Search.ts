import { RectCoords, Region } from '@nyris/nyris-api';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_REGION } from '../../constants';
import { initialState } from './search.initialState';

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

    setSelectedRegion: (state, data: PayloadAction<RectCoords | undefined>) => {
      return {
        ...state,
        selectedRegion: data.payload,
      };
    },

    setRequestImage: (state, data: PayloadAction<any>) => ({
      ...state,
      requestImage: {
        canvas: data.payload,
        id: Math.random().toString(),
      },
      regions: [],
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
        selectedRegion: DEFAULT_REGION,
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
        keyFilter: state.keyFilter || '',
        preFilterDropdown: false,
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
} = searchSlice.actions;
export default searchSlice.reducer;
