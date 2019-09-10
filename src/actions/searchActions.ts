import NyrisAPI from './../NyrisAPI';
import {Region, RegionResult} from "../types";
import {ThunkAction} from "redux-thunk";


type SearchAction =
    | { type: 'FEEDBACK_SUBMIT_POSITIVE' }
    | { type: 'FEEDBACK_SUBMIT_NEGATIVE' }
    | { type: 'SELECT_IMAGE', image: HTMLCanvasElement }
    | { type: 'REGION_REQUEST_START' }
    | { type: 'REGION_REQUEST_SUCCEED', regions: RegionResult[] }
    | { type: 'REGION_REQUEST_FAIL', reason: string }
    | { type: 'SEARCH_REQUEST_START' }
    | { type: 'SEARCH_REQUEST_SUCCEED', results: any[], requestId: string, duration: number }
    | { type: 'SEARCH_REQUEST_FAIL', reason: string }



export const searchImage = (canvas: HTMLCanvasElement) : ThunkAction<Promise<void>, any, any, SearchAction> => (
    async (dispatch, getState) => {
        const { settings } = getState();
        const api = new NyrisAPI(settings);
        console.log("setting image", canvas);
        dispatch({type: 'SELECT_IMAGE', image: canvas});

        if (settings.regions) {
            try {
                dispatch({type: "REGION_REQUEST_START"});
                let regions = await api.findRegions(canvas, settings);
                dispatch({type: 'REGION_REQUEST_SUCCEED', regions });
            } catch (e) {
                dispatch({type: 'REGION_REQUEST_FAIL', reason: e.message});
                console.error(e);
                throw e;
            }

        }

        dispatch({ type: 'SEARCH_REQUEST_START'});
        try {
            const {results, duration, requestId} = await api.findByImage(canvas, settings);
            dispatch({ type: 'SEARCH_REQUEST_SUCCEED', results, requestId, duration });
        } catch (e) {
            dispatch({ type: 'SEARCH_REQUEST_FAIL', reason: e.message });
            throw e;
        }



    }
);




interface CategoryPrediction {
    name: string,
    score: number
}

export interface SearchState {
    results: any[],
    duration?: number,
    requestId?: string,
    regions: RegionResult[],
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
    selectedRegion: {left: 0, right: 1, top: 0, bottom: 1},
    requestImage: undefined,
    fetchingResults: false,
    fetchingRegions: false,
    filterOptions: [],
    categoryPredictions: []
};

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
