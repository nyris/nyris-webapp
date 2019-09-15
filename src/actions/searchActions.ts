import {AppState, RectCoords, Region} from "../types";


export type SearchAction =
    | { type: 'FEEDBACK_SUBMIT_POSITIVE' }
    | { type: 'FEEDBACK_SUBMIT_NEGATIVE' }
    | { type: 'SELECT_IMAGE', image: HTMLCanvasElement }
    | { type: 'REGION_REQUEST_START', image: HTMLCanvasElement }
    | { type: 'REGION_REQUEST_SUCCEED', regions: Region[] }
    | { type: 'REGION_REQUEST_FAIL', reason: string, exception: any }
    | { type: 'SEARCH_REQUEST_START', image: HTMLCanvasElement, region?: RectCoords  }
    | { type: 'SEARCH_REQUEST_SUCCEED', results: any[], requestId: string, duration: number, categoryPredictions: CategoryPrediction[] }
    | { type: 'SEARCH_REQUEST_FAIL', reason: string, exception?: any }
    | { type: 'REGION_CHANGED', region: Region}

interface CategoryPrediction {
    name: string,
    score: number
}

export interface SearchState {
    results: any[],
    duration?: number,
    requestId?: string,
    sessionId?: string,
    regions: Region[],
    selectedRegion: Region,
    fetchingRegions: boolean,
    fetchingResults: boolean,
    filterOptions: string[],
    requestImage?:  HTMLCanvasElement,
    categoryPredictions: CategoryPrediction[]
}

const initialState : SearchState = {
    results: [],
    regions: [],
    selectedRegion: {x1: 0, x2: 1, y1: 0, y2: 1},
    requestImage: undefined,
    fetchingResults: false,
    fetchingRegions: false,
    filterOptions: [],
    categoryPredictions: []
};


export const selectImage = (image: HTMLCanvasElement): SearchAction => ({ type: 'SELECT_IMAGE', image });
export const selectionChanged = (region: RectCoords) : SearchAction => ({ type: 'REGION_CHANGED', region });
export const searchRegions = (image: HTMLCanvasElement): SearchAction => ({ type: 'REGION_REQUEST_START', image });
export const searchOffersForImage = (image: HTMLCanvasElement, region?: RectCoords) : SearchAction => ({
    type: 'SEARCH_REQUEST_START',
    image,
    region
});

export const reducer = (state : SearchState = initialState, action: SearchAction)  => {
    switch (action.type) {
        case "SELECT_IMAGE":
            let { image } = action;
            return {
                ...initialState,
                requestImage: image
            };
        case 'REGION_REQUEST_START':
            return {
                ...state,
                fetchingRegions: true
            };
        case "REGION_REQUEST_SUCCEED":
            return {
                ...state,
                fetchingRegions: false,
                regions: action.regions
            };
        case "SEARCH_REQUEST_START":
            return {
                ...state,
                fetchingResults: true
            };
        case "SEARCH_REQUEST_SUCCEED":
            let { results, requestId, duration, categoryPredictions } = action;
            return {
                ...state,
                results,
                requestId,
                fetchingResults: false,
                sessionId: state.sessionId || requestId,
                categoryPredictions,
                duration
            };
        case "SEARCH_REQUEST_FAIL":
            return {
                ...state,
                fetchingResults: false,
                errorMessage: action.reason
            }
    }
    return state;
};
