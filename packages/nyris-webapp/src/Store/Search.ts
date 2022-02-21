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
};

export const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    loadFile: (state, data: PayloadAction<any>) => {
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
      } = payload;
      return {
        ...state,
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
    submitPositiveFeedback: (state, data: PayloadAction<RectCoords>) => {
      return;
    },
    submitNegativeFeedback: (state, data: PayloadAction<RectCoords>) => {
      return;
    },
    loadingActionResults: (state, _data: PayloadAction<any>) => {
      return {
        ...state,
        fetchingResults: true,
      };
    },
    loadingActionRegions: (state, _data: PayloadAction<any>) => {
      return {
        ...state,
        fetchingRegions: true,
      };
    },
  },
});

export const {
  loadFile,
  selectionChanged,
  submitPositiveFeedback,
  submitNegativeFeedback,
  loadCadFileLoad,
  loadFileSelectRegion,
  loadingActionResults,
  loadingActionRegions,
} = searchSlice.actions;
export default searchSlice.reducer;
