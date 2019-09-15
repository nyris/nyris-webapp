// feedback api
import {combineEpics, Epic, ofType} from "redux-observable";
import {AppAction, AppState, ImageSearchOptions} from "../types";
import {ignoreElements, switchMap, tap, withLatestFrom} from "rxjs/operators";
import {History} from "history";
import NyrisAPI from "../NyrisAPI";
import {rectToCrop} from "../nyris";
import {searchOffersForImage, searchRegions} from "../actions/searchActions";

interface EpicsDependencies {
    api: NyrisAPI,
    history: History
}

type EpicConf = Epic<AppAction, AppAction, AppState, EpicsDependencies>;

const feedbackSuccessEpic: EpicConf = (action$, state$, {api}) => action$.pipe(
    ofType('FEEDBACK_SUBMIT_POSITIVE', "FEEDBACK_SUBMIT_NEGATIVE"),
    withLatestFrom(state$),
    tap(async ([{type}, state]) => {
        const success = type === 'FEEDBACK_SUBMIT_POSITIVE';
        const sessionId = state.search.sessionId || state.search.requestId;
        if (sessionId && state.search.requestId) {
            await api.sendFeedback(sessionId, state.search.requestId, {
                event: 'feedback', data: {success}
            });
        }
    }),
    ignoreElements()
);

const feedbackRegionEpic: EpicConf = (action$, state$, {api}) => action$.pipe(
    ofType('REGION_CHANGED'),
    withLatestFrom(state$),
    tap(async ([action, state]) => {
        if (action.type === 'REGION_CHANGED') {
            let {region: {x1, x2, y1, y2}} = action;
            const sessionId = state.search.sessionId || state.search.requestId;
            if (sessionId && state.search.requestId) {
                await api.sendFeedback(sessionId, state.search.requestId, {
                    event: 'region', data: {rect: {x: x1, y: y1, w: x2 - x1, h: y2 - y1}}
                });
            }
        }
    }),
    ignoreElements()
);

const feedbackClickEpic: EpicConf = (action$, state$, {api}) => action$.pipe(
    ofType('RESULT_LINK_CLICKED', 'RESULT_IMAGE_CLICKED'),
    withLatestFrom(state$),
    tap(async ([action, state]) => {
        if (action.type === 'RESULT_LINK_CLICKED' || action.type === 'RESULT_IMAGE_CLICKED') {
            let {position} = action;
            const sessionId = state.search.sessionId || state.search.requestId;
            if (sessionId && state.search.requestId) {
                await api.sendFeedback(sessionId, state.search.requestId, {
                    event: 'click', data: {positions: [position]}
                });
            }
        }
    }),
    ignoreElements()
);


const historyEpic: EpicConf = (action$, state$, {history}) => action$.pipe(
    ofType('SHOW_RESULTS', 'SHOW_START'),
    tap((action) => {
        let { type } = action;
        if (type === 'SHOW_RESULTS' && history.location.pathname !== '/results') {
            history.push('/results');
        }
        if (type === 'SHOW_START' && history.location.pathname !== '/') {
            history.goBack();
        }
    }),
    ignoreElements()
);


const imageSearch: EpicConf = (action$, state$, {api}) => action$.pipe(
    ofType('SEARCH_REQUEST_START'),
    withLatestFrom(state$),
    switchMap(async ([action, {settings}]) : Promise<AppAction> => {
        if (action.type !== 'SEARCH_REQUEST_START') {
            throw new Error(`Wrong action type ${action.type}`);
        }

        let { image, region} = action;

        let options : ImageSearchOptions = settings;

        if (region) {
            let { x1, x2, y1, y2} = region;
            let crop = rectToCrop({
                x1: x1*image.width,
                x2: x2*image.width,
                y1: y1*image.height,
                y2: y2*image.height
            });
            options = {
                ...options,
                crop
            }
        }

        try {
            const {results, duration, requestId, categoryPredictions} = await api.findByImage(image, options);
            return ({ type: 'SEARCH_REQUEST_SUCCEED', results, requestId, duration, categoryPredictions });
        } catch (e) {
            return ({ type: 'SEARCH_REQUEST_FAIL', reason: e.message, exception: e });
        }
    })
);


const regionSearch: EpicConf = (action$, state$, {api}) => action$.pipe(
    ofType('REGION_REQUEST_START'),
    withLatestFrom(state$),
    switchMap(async ([action, {settings}]) : Promise<AppAction> => {
        if (action.type !== 'REGION_REQUEST_START') {
            throw new Error(`Wrong action type ${action.type}`);
        }

        let { image } = action;

        try {
            let regions = await api.findRegions(image, settings);
            return {type: 'REGION_REQUEST_SUCCEED', regions };

        } catch (e) {
            console.error(e);
            return {type: 'REGION_REQUEST_FAIL', reason: e.message, exception: e};
        }
    })
);


const startSearchOnImageSelected: EpicConf = (action$, state$) => action$.pipe(
    ofType('SELECT_IMAGE'),
    withLatestFrom(state$),
    switchMap(async ([action, {settings}]) : Promise<AppAction> => {
        if (action.type !== 'SELECT_IMAGE') {
            throw new Error(`Wrong action type ${action.type}`);
        }

        let { image } = action;

        if (settings.regions) {
            return searchRegions(image);
        }
        return searchOffersForImage(image);
    })
);


const startSearchOnRegionsSuccessful: EpicConf = (action$, state$) => action$.pipe(
    ofType('REGION_REQUEST_SUCCEED'),
    withLatestFrom(state$),
    switchMap(async ([action, { search: { requestImage}}]) : Promise<AppAction> => {
        if (action.type !== 'REGION_REQUEST_SUCCEED') {
            throw new Error(`Wrong action type ${action.type}`);
        }
        if (!requestImage) {
            throw new Error(`No requestImage`);
        }
        let { regions } = action;

        let selection = undefined;
        if (regions.length > 0) {
            selection  = regions[0];
        }
        return searchOffersForImage(requestImage, selection);
    })
);


const startSearchOnRegionChange: EpicConf = (action$, state$) => action$.pipe(
    ofType('REGION_CHANGED'),
    withLatestFrom(state$),
    switchMap(async ([action, { search: { requestImage}}]) : Promise<AppAction> => {
        if (action.type !== 'REGION_CHANGED') {
            throw new Error(`Wrong action type ${action.type}`);
        }
        if (!requestImage) {
            throw new Error(`No requestImage`);
        }
        let { region } = action;
        return searchOffersForImage(requestImage, region);
    })
);




const rootEpic = combineEpics(
    feedbackSuccessEpic,
    feedbackRegionEpic,
    feedbackClickEpic,
    historyEpic,
    imageSearch,
    regionSearch,
    startSearchOnImageSelected,
    startSearchOnRegionsSuccessful,
    startSearchOnRegionChange
);

export default rootEpic;
