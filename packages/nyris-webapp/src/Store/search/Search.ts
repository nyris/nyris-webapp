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
        preFilter: state.preFilter || '',
        preFilterDropdown: false,
        imageCaptureHelpModal: false,
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
    setPreFilter: (state, data: PayloadAction<Record<string, boolean>>) => {
      const { payload } = data;
      return {
        ...state,
        preFilter: payload,
      };
    },
    setPreFilterDropdown: (state, data: PayloadAction<boolean>) => {
      return {
        ...state,
        preFilterDropdown: data.payload,
      };
    },
    setImageCaptureHelpModal: (state, data: PayloadAction<boolean>) => {
      return {
        ...state,
        imageCaptureHelpModal: data.payload,
      };
    },
    setFilter: (state, data: PayloadAction<any>) => {
      return {
        ...state,
        filter: data.payload,
      };
    },
  },
});

export const {
  changeValueTextSearch,
  configureFilter,
  loadFileSelectRegion,
  loadingActionRegions,
  loadingActionResults,
  onResetRequestImage,
  onToggleModalItemDetail,
  reset,
  resultSearchText,
  searchFileImageNonRegion,
  selectionChanged,
  setError,
  setImageCaptureHelpModal,
  setImageSearchInput,
  setPreFilterDropdown,
  setRegions,
  setRequestImage,
  setSearchResults,
  setSelectedRegion,
  setPreFilter,
  setUpdateSession,
  updateResultChangePosition,
  updateResults,
  updateStatusLoading,
  updateValueTextSearchMobile,
  setFilter,
} = searchSlice.actions;
export default searchSlice.reducer;
