import {CanvasWithId} from "../types";
import {Code, RectCoords, Region, selectFirstCenteredRegion} from '@nyris/nyris-api';

export type ImageSourceType =
    | { url: string }
    | { file: File }
    | { image: HTMLCanvasElement }

export type SearchAction =
    | { type: 'FEEDBACK_SUBMIT_POSITIVE' }
    | { type: 'FEEDBACK_SUBMIT_NEGATIVE' }
    | { type: 'IMAGE_LOADED', image: CanvasWithId }
    | { type: 'REGION_REQUEST_START', image: HTMLCanvasElement }
    | { type: 'REGION_REQUEST_SUCCEED', regions: Region[] }
    | { type: 'REGION_REQUEST_FAIL', reason: string, exception: any }
    | { type: 'SEARCH_REQUEST_START', image: HTMLCanvasElement, normalizedRect?: RectCoords  }
    | { type: 'SEARCH_REQUEST_START', file: File }
    | { type: 'SEARCH_REQUEST_SUCCEED', results: any[], requestId: string, duration: number, categoryPredictions: CategoryPrediction[], codes: Code[] }
    | { type: 'SEARCH_REQUEST_FAIL', reason: string, exception?: any }
    | { type: 'REGION_CHANGED', normalizedRect: RectCoords}
    | { type: 'LOAD_IMAGE'} & ImageSourceType
    | { type: 'LOAD_FILE', file: File}
    | { type: 'CAD_LOADED', file: File}

interface CategoryPrediction {
    name: string,
    score: number
}

export interface SearchState {
    results: any[]
    duration?: number
    requestId?: string
    sessionId?: string
    regions: Region[]
    selectedRegion: RectCoords
    fetchingRegions: boolean
    fetchingResults: boolean
    filterOptions: string[]
    requestImage?:  CanvasWithId
    requestCadFile?:  File
    categoryPredictions: CategoryPrediction[]
    codes: Code[],
    errorMessage: string
}

const initialState : SearchState = {
    results: [],
    regions: [],
    selectedRegion: {x1: 0.1, x2: 0.9, y1: 0.1, y2: 0.9},
    requestImage: undefined,
    fetchingResults: false,
    fetchingRegions: false,
    filterOptions: [],
    categoryPredictions: [],
    codes: [],
    errorMessage: ''
};


export const loadFile = (file: File ): SearchAction => ({ type: 'LOAD_FILE', file });
export const loadUrl = (url: string): SearchAction => ({ type: 'LOAD_IMAGE', url });
export const loadCanvas = (image: HTMLCanvasElement): SearchAction => ({ type: 'LOAD_IMAGE', image });
export const imageLoaded = (image: HTMLCanvasElement, id: string): SearchAction => ({ type: 'IMAGE_LOADED', image: {canvas: image, id: id} });
export const cadFileLoaded = (file: File, id: string): SearchAction => ({ type: 'CAD_LOADED', file});
export const selectionChanged = (normalizedRect: RectCoords) : SearchAction => ({ type: 'REGION_CHANGED', normalizedRect });
export const searchRegions = (image: HTMLCanvasElement): SearchAction => ({ type: 'REGION_REQUEST_START', image });
export const searchOffersForImage = (image: HTMLCanvasElement, normalizedRect?: RectCoords) : SearchAction => ({
    type: 'SEARCH_REQUEST_START',
    image,
    normalizedRect
});
export const searchOffersForCad = (file: File) : SearchAction => ({
    type: 'SEARCH_REQUEST_START',
    file
});
export const submitPositiveFeedback = () : SearchAction => ({ type: 'FEEDBACK_SUBMIT_POSITIVE'});
export const submitNegativeFeedback = () : SearchAction => ({ type: 'FEEDBACK_SUBMIT_NEGATIVE'});

export const reducer = (state : SearchState = initialState, action: SearchAction)  => {
    switch (action.type) {
        case "IMAGE_LOADED":
            let { image } = action;
            console.log('image', image)
            return {
                ...initialState,
                requestImage: image
            };
        case "CAD_LOADED":
            let { file } = action;
            return {
                ...initialState,
                requestCadFile: file
            }
        case 'REGION_REQUEST_START':
            return {
                ...state,
                fetchingRegions: true
            };
        case "REGION_REQUEST_SUCCEED":
            return {
                ...state,
                fetchingRegions: false,
                regions: action.regions,
                selectedRegion:  selectFirstCenteredRegion(action.regions, 0.3, state.selectedRegion)
            };
        case "REGION_REQUEST_FAIL":
            return {
                ...state,
                fetchingRegions: false,
                errorMessage: action.exception.response.data.detail
            };
        case "SEARCH_REQUEST_START":
            return {
                ...state,
                fetchingResults: true
            };
        case "SEARCH_REQUEST_SUCCEED":
            let { results, requestId, duration, categoryPredictions, codes } = action;
            return {
                ...state,
                results,
                requestId,
                fetchingResults: false,
                sessionId: state.sessionId || requestId,
                categoryPredictions,
                codes,
                duration
            };
        case "SEARCH_REQUEST_FAIL":
            return {
                ...state,
                fetchingResults: false,
                errorMessage: action.reason
            };
        case "REGION_CHANGED":
            return {
                ...state,
                selectedRegion: action.normalizedRect
            }
    }
    return state;
};
