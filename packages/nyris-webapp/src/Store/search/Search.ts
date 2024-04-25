import { RectCoords, Region } from '@nyris/nyris-api';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_REGION } from '../../constants';
import { initialState } from './search.initialState';
import { isUndefined } from 'lodash';

const getId = () => {
  const crypto = window.crypto;
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0];
}

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
        id: getId().toString(),
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
        preFilter: state.preFilter || {},
        postFilter: {},
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
  },
});

export const {
  changeValueTextSearch,
  clearPostFilter,
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
  setFilter,
  setImageCaptureHelpModal,
  setImageSearchInput,
  setPostFilter,
  setPreFilter,
  setPreFilterDropdown,
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
} = searchSlice.actions;
export default searchSlice.reducer;
