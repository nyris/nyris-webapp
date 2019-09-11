import NyrisAPI from './../NyrisAPI';
import {ImageSearchOptions, RectCoords, Region} from "../types";
import {ThunkAction} from "redux-thunk";
import {rectToCrop} from "../nyris";


export type SearchAction =
    | { type: 'FEEDBACK_SUBMIT_POSITIVE' }
    | { type: 'FEEDBACK_SUBMIT_NEGATIVE' }
    | { type: 'SELECT_IMAGE', image: HTMLCanvasElement }
    | { type: 'REGION_REQUEST_START' }
    | { type: 'REGION_REQUEST_SUCCEED', regions: Region[] }
    | { type: 'REGION_REQUEST_FAIL', reason: string }
    | { type: 'SEARCH_REQUEST_START' }
    | { type: 'SEARCH_REQUEST_SUCCEED', results: any[], requestId: string, duration: number }
    | { type: 'SEARCH_REQUEST_FAIL', reason: string }

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


export const selectImage = (canvas: HTMLCanvasElement): ThunkAction<Promise<void>, any, any, SearchAction> =>
    async (dispatch, getState) => {
        const { settings } = getState();
        await dispatch({type: 'SELECT_IMAGE', image: canvas});
        let selection = undefined;
        if (settings.regions) {
            await dispatch(searchRegions(canvas));
            let {search: {regions} } = getState();
            if (regions.length > 0) {
                selection  = regions[0];
            }
        }
        await dispatch(searchOffersForImage(canvas, selection));
    };

export const selectionChanged = (newSelection: RectCoords) : ThunkAction<Promise<void>, any, any, SearchAction> =>
    async (dispatch, getState) => {
        let { search: { requestImage }} = getState();
        await dispatch(searchOffersForImage(requestImage, newSelection));
    };



export const searchRegions = (canvas: HTMLCanvasElement): ThunkAction<Promise<void>, any, any, SearchAction> =>
    async (dispatch, getState) => {
        const { settings } = getState();
        const api = new NyrisAPI(settings);
        try {
            dispatch({type: "REGION_REQUEST_START"});
            let regions = await api.findRegions(canvas, settings);
            dispatch({type: 'REGION_REQUEST_SUCCEED', regions });

        } catch (e) {
            dispatch({type: 'REGION_REQUEST_FAIL', reason: e.message});
            console.error(e);
            throw e;
        }
    };



export const searchOffersForImage = (canvas: HTMLCanvasElement, section?: RectCoords) : ThunkAction<Promise<void>, any, any, SearchAction> => (
    async (dispatch, getState) => {
        const { settings } = getState();
        const api = new NyrisAPI(settings);
        let options : ImageSearchOptions = settings;;

        if (section) {
            let { x1, x2, y1, y2} = section;
            let crop = rectToCrop({
                x1: x1*canvas.width,
                x2: x2*canvas.width,
                y1: y1*canvas.height,
                y2: y2*canvas.height
            });
            options = {
                ...options,
                crop
            }
        }

        dispatch({ type: 'SEARCH_REQUEST_START'});
        try {
            const {results, duration, requestId} = await api.findByImage(canvas, options);
            dispatch({ type: 'SEARCH_REQUEST_SUCCEED', results, requestId, duration });
        } catch (e) {
            dispatch({ type: 'SEARCH_REQUEST_FAIL', reason: e.message });
            throw e;
        }
    }
);

export const reducer = (state : SearchState = initialState, action: SearchAction)  => {
    switch (action.type) {
        case "SELECT_IMAGE":
            let { image } = action;
            return {
                ...state,
                requestImage: image
            };

        case "REGION_REQUEST_SUCCEED":
            let { regions } = action;
            return {
                ...state,
                regions
            };
        case "SEARCH_REQUEST_START":
            return {
                ...state,
                fetchingResults: true
            };
        case "SEARCH_REQUEST_SUCCEED":
            let { results, requestId, duration } = action;
            return {
                ...state,
                results,
                fetchingResults: false,
                requestId,
                sessionId: state.sessionId || requestId,
                duration
            };
        case "SEARCH_REQUEST_FAIL":
            return {
                ...state,
                fetchingResults: false,
            }
    }
    return state;
};
