import { RectCoords, Region } from '@nyris/nyris-api';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_REGION } from '../../constants';
import { initialState } from './search.initialState';
import { isUndefined } from 'lodash';

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchResults: (state, data) => {
      const { payload } = data;
      const {
        results,
        session,
        categoryPredictions,
        codes,
        duration,
        filters,
      } = payload;

      return {
        ...state,
        filters,
        results,
        requestId: session,
        categoryPredictions,
        codes,
        duration,
        sessionId: session,
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

    loadingActionResults: state => {
      return {
        ...state,
        fetchingResults: true,
      };
    },

    changeValueTextSearch: (state, data: PayloadAction<any>) => {
      const { payload } = data;
      return {
        ...state,
        valueTextSearch: payload,
      };
    },

    updateResults: (state, data: PayloadAction<any>) => {
      const { payload } = data;
      return {
        ...state,
        results: payload,
      };
    },
    updateQueryText: (state, data: PayloadAction<string>) => {
      const { payload } = data;
      return {
        ...state,
        queryText: payload,
      };
    },
    reset: (state, data: PayloadAction<any>) => {
      return {
        results: [],
        regions: [],
        selectedRegion: DEFAULT_REGION,
        requestImage: undefined,
        fetchingResults: false,
        filterOptions: [],
        categoryPredictions: [],
        codes: [],
        errorMessage: '',
        valueTextSearch: {},
        resultSearchText: [],
        filters: [],
        loadingSearchAlgolia: false,
        textSearchInputMobile: '',
        isShowModalDetailItemMobile: false,
        preFilter: state.preFilter || {},
        postFilter: {},
        imageCaptureHelpModal: false,
        showFeedback: false,
        firstSearchImage: null,
        firstSearchResults: null,
        firstSearchPrefilters: null,
      };
    },

    onResetRequestImage: (state, data: PayloadAction<any>) => {
      return {
        ...state,
        requestImage: undefined,
        results: [],
        regions: [],
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
    setPostFilter: (state, data: PayloadAction<Record<string, string>>) => {
      const { payload } = data;

      let filter = { ...state.postFilter } || {};
      const key = Object.keys(payload)[0];

      if (
        !isUndefined(filter[key]) &&
        !isUndefined(filter[key][payload[key]])
      ) {
        filter[key] = {
          ...filter[key],
          [payload[key]]: !filter[key][payload[key]],
        };
      } else if (!filter[key]) {
        filter = { ...filter, [key]: { [payload[key]]: true } };
      } else {
        filter[key] = { ...filter[key], [payload[key]]: true };
      }

      return {
        ...state,
        postFilter: { ...filter },
      };
    },

    clearPostFilter: state => {
      return {
        ...state,
        postFilter: {},
      };
    },
    setShowFeedback: (state, data: PayloadAction<boolean>) => ({
      ...state,
      showFeedback: data.payload,
    }),
    setFirstSearchResults: (state, data: PayloadAction<any>) => ({
      ...state,
      firstSearchResults: data.payload,
    }),
    setFirstSearchImage: (state, data: PayloadAction<any>) => ({
      ...state,
      firstSearchImage: data.payload,
    }),
    setFirstSearchPrefilters: (state, data: PayloadAction<any>) => ({
      ...state,
      firstSearchPrefilters: data.payload,
    }),
  },
});

export const {
  changeValueTextSearch,
  clearPostFilter,
  loadingActionResults,
  onResetRequestImage,
  onToggleModalItemDetail,
  reset,
  selectionChanged,
  setFilter,
  setImageCaptureHelpModal,
  setPostFilter,
  setPreFilter,
  setRegions,
  setRequestImage,
  setSearchResults,
  setSelectedRegion,
  setUpdateSession,
  updateQueryText,
  updateResultChangePosition,
  updateResults,
  updateStatusLoading,
  updateValueTextSearchMobile,
  setShowFeedback,
  setFirstSearchImage,
  setFirstSearchResults,
  setFirstSearchPrefilters,
} = searchSlice.actions;
export default searchSlice.reducer;
