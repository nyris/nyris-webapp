import NyrisAPI from './../NyrisAPI';
import {Region, RegionResult} from "../types";
import {ThunkAction} from "redux-thunk";


type SearchAction =
    | { type: 'FEEDBACK_SUBMIT_POSITIVE' }
    | { type: 'FEEDBACK_SUBMIT_NEGATIVE' }
    | { type: 'REGION_REQUEST_START' }
    | { type: 'REGION_REQUEST_SUCCEED', regions: Region[] }
    | { type: 'REGION_REQUEST_FAIL', reason: string }
    | { type: 'SEARCH_REQUEST_START' }
    | { type: 'SEARCH_REQUEST_SUCCEED', results: any[], requestId: string, duration: number }
    | { type: 'SEARCH_REQUEST_FAIL', reason: string }




export const getRegions = (canvas: HTMLCanvasElement) : ThunkAction<Promise<void>, any, {}, SearchAction> => (
    async (dispatch, getState) => {
        dispatch({ type: 'REGION_REQUEST_START'});
        const { settings } = getState();
        const api = new NyrisAPI(settings);
        try {
            const regions = await api.findRegions(canvas, settings);
            dispatch({ type: 'REGION_REQUEST_SUCCEED', regions: regions.map((r: RegionResult)=> r.region) });
        } catch (e) {
            dispatch({ type: 'REGION_REQUEST_FAIL', reason: e.message });
        }
    }
);

export const searchImage = (canvas: HTMLCanvasElement) : ThunkAction<Promise<void>, any, {}, SearchAction> => (
    async (dispatch, getState) => {
        dispatch({ type: 'SEARCH_REQUEST_START'});
        const { settings } = getState();
        const api = new NyrisAPI(settings);
        try {
            const {results, duration, requestId} = await api.findByImage(canvas, settings);
            dispatch({ type: 'SEARCH_REQUEST_SUCCEED', results, requestId, duration });
        } catch (e) {
            dispatch({ type: 'SEARCH_REQUEST_FAIL', reason: e.message });
            throw e;
        }



    }
);



interface RequestInfo {
    duration: number,
    id: string
}

interface CategoryPrediction {
    name: string,
    score: number
}

export interface SearchState {
    results: any[],
    requests: RequestInfo[],
    fetchingRegions: boolean,
    fetchingResults: boolean,
    filterOptions: string[],
    categoryPredictions: CategoryPrediction[]
}

const initialState : SearchState = {
    results: [],
    requests: [],
    fetchingResults: false,
    fetchingRegions: false,
    filterOptions: [],
    categoryPredictions: []
};

export const reducer = (state : SearchState = initialState, action: SearchAction)  => {
    switch (action.type) {
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
                requests: [
                    ...state.requests,
                    { id: requestId, duration }
                ]
            };
        case "SEARCH_REQUEST_FAIL":
            return {
                ...state,
                fetchingResults: false,
            }
    }
    return state;
};
