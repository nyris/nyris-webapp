import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CanvasWithId } from "types";
import { Code, RectCoords, Region } from "@nyris/nyris-api";

export type ImageSourceType =
  | { url: string }
  | { file: File }
  | { image: HTMLCanvasElement };

export type SearchAction =
  | { type: "FEEDBACK_SUBMIT_POSITIVE" }
  | { type: "FEEDBACK_SUBMIT_NEGATIVE" }
  | { type: "IMAGE_LOADED"; image: CanvasWithId }
  | { type: "REGION_REQUEST_START"; image: HTMLCanvasElement }
  | { type: "REGION_REQUEST_SUCCEED"; regions: Region[] }
  | { type: "REGION_REQUEST_FAIL"; reason: string; exception: any }
  | {
      type: "SEARCH_REQUEST_START";
      image: HTMLCanvasElement;
      normalizedRect?: RectCoords;
    }
  | { type: "SEARCH_REQUEST_START"; file: File }
  | {
      type: "SEARCH_REQUEST_SUCCEED";
      results: any[];
      requestId: string;
      duration: number;
      categoryPredictions: CategoryPrediction[];
      codes: Code[];
    }
  | { type: "SEARCH_REQUEST_FAIL"; reason: string; exception?: any }
  | { type: "REGION_CHANGED"; normalizedRect: RectCoords }
  | ({ type: "LOAD_IMAGE" } & ImageSourceType)
  | { type: "LOAD_FILE"; file: File }
  | { type: "CAD_LOADED"; file: File };

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
  selectedRegion: RectCoords;
  fetchingRegions: boolean;
  fetchingResults: boolean;
  filterOptions: string[];
  requestImage?: CanvasWithId;
  requestCadFile?: File;
  categoryPredictions: CategoryPrediction[];
  codes: Code[];
  errorMessage: string;
  valueTextSearch: any;
  resultSearchText: any[];
  filters: any[];
  configureFilter?: any;
  loadingSearchAlgolia: boolean;
}

// TODO: init state
const initialState: SearchState = {
  results: [],
  regions: [],
  selectedRegion: { x1: 0.1, x2: 0.9, y1: 0.1, y2: 0.9 },
  requestImage: undefined,
  fetchingResults: false,
  fetchingRegions: false,
  filterOptions: [],
  categoryPredictions: [],
  codes: [],
  errorMessage: "",
  valueTextSearch: {},
  resultSearchText: [],
  filters: [],
  configureFilter: {},
  loadingSearchAlgolia: false,
};


  export const searchSlice = createSlice({
    name: "search",
    initialState,
    reducers: {
      setSearchResults: (state, data) => {
      const { payload } = data;
      const {
        requestImage,
        results,
        requestId,
        categoryPredictions,
        codes,
        duration,
        regions,
        selectedRegion,
        filters,
      } = payload;
      return {
        ...state,
        filters,
        requestImage,
        results,
        requestId,
        categoryPredictions,
        codes,
        duration,
        sessionId: state.sessionId || requestId,
        regions,
        selectedRegion,
        fetchingResults: false,
      };
    },

    loadCadFileLoad: (state, data: PayloadAction<any>) => {
      const { payload } = data;
      return {
        ...state,
        requestCadFile: payload,
      };
    },

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
    submitPositiveFeedback: () => {
      return;
    },
    submitNegativeFeedback: () => {
      return;
    },
    loadingActionResults: (state) => {
      return {
        ...state,
        fetchingResults: true,
      };
    },
    loadingActionRegions: (state) => {
      return {
        ...state,
        fetchingRegions: true,
      };
    },
    searchFileImageNonRegion: (state, data: PayloadAction<any>) => {
      const { payload } = data;
      const {
        results,
        requestId,
        duration,
        categoryPredictions,
        codes,
        requestImage,
      } = payload;
      return {
        ...state,
        results,
        requestId,
        duration,
        categoryPredictions,
        codes,
        requestImage,
        fetchingResults: false,
      };
    },
    changeValueTextSearch: (state: any, data: PayloadAction<any>) => {
      const { payload } = data;
      return {
        ...state,
        valueTextSearch: payload,
      };
    },
    resultSearchText: (state: any, data: PayloadAction<any>) => {
      const { payload } = data;
      return {
        ...state,
        resultSearchText: payload,
      };
    },
    updateResults: (state: any, data: PayloadAction<any>) => {
      const { payload } = data;
      return {
        ...state,
        results: payload,
      };
    },
    reset: (state: any, data: PayloadAction<any>) => {
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
        errorMessage: "",
        valueTextSearch: {},
        resultSearchText: [],
        filters: [],
        loadingSearchAlgolia: false,
      };
    },
    configureFilter: (state: any, data: PayloadAction<any>) => {
      const { payload } = data;
      return {
        ...state,
        configureFilter: payload,
      };
    },
    setUpdateSession: (state: any, data: PayloadAction<string>) => {
      const { payload } = data;
      return {
        ...state,
        sessionId: payload,
      };
    },
    updateResultChangePosition: (state: any, data: PayloadAction<any>) => {
      const { payload } = data;
      const { results } = payload;
      return {
        ...state,
        results,
      };
    },
  },
});

export const {
  setSearchResults,
  selectionChanged,
  submitPositiveFeedback,
  submitNegativeFeedback,
  loadCadFileLoad,
  loadFileSelectRegion,
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
} = searchSlice.actions;
export default searchSlice.reducer;
