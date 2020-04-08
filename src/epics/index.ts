// feedback api
import {combineEpics, Epic, ofType} from "redux-observable";
import {AppAction, AppState, ImageSearchOptions} from "../types";
import {debounceTime, delay, ignoreElements, map, switchMap, tap, withLatestFrom} from "rxjs/operators";
import {History} from "history";
import NyrisAPI from "../NyrisAPI";
import {fileOrBlobToCanvas} from "../nyris";
import {imageLoaded, searchOffersForImage, searchRegions} from "../actions/searchActions";
import {showFeedback, showResults} from "../actions/nyrisAppActions";

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
    debounceTime(600),
    withLatestFrom(state$),
    tap(async ([action, state]) => {
        if (action.type === 'REGION_CHANGED') {
            let {normalizedRect: {x1, x2, y1, y2}} = action;
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

        let { image, normalizedRect} = action;

        let options : ImageSearchOptions = {
            cropRect: normalizedRect
        };

        try {
            const {results, duration, requestId, categoryPredictions, codes} = await api.findByImage(image, options);
            return ({ type: 'SEARCH_REQUEST_SUCCEED', results, requestId, duration, categoryPredictions, codes });
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
            let regions = await api.findRegions(image);
            return {type: 'REGION_REQUEST_SUCCEED', regions };

        } catch (e) {
            console.error(e);
            return {type: 'REGION_REQUEST_FAIL', reason: e.message, exception: e};
        }
    })
);


const startSearchOnImageLoaded: EpicConf = (action$, state$) => action$.pipe(
    ofType('IMAGE_LOADED'),
    withLatestFrom(state$),
    switchMap(async ([action, {settings}]) : Promise<AppAction> => {
        if (action.type !== 'IMAGE_LOADED') {
            throw new Error(`Wrong action type ${action.type}`);
        }

        let { image } = action;

        if (settings.regions) {
            return searchRegions(image.canvas);
        }
        return searchOffersForImage(image.canvas);
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
            selection  = regions[0].normalizedRect;
        }
        return searchOffersForImage(requestImage.canvas, selection);
    })
);


const startSearchOnRegionChange: EpicConf = (action$, state$) => action$.pipe(
    ofType('REGION_CHANGED'),
    debounceTime(600),
    withLatestFrom(state$),
    switchMap(async ([action, { search: { requestImage}}]) : Promise<AppAction> => {
        if (action.type !== 'REGION_CHANGED') {
            throw new Error(`Wrong action type ${action.type}`);
        }
        if (!requestImage) {
            throw new Error(`No requestImage`);
        }
        let { normalizedRect } = action;
        return searchOffersForImage(requestImage.canvas, normalizedRect);
    })
);

const loadImage: EpicConf = (action$) => action$.pipe(
    ofType('LOAD_IMAGE'),
    switchMap(async (action) : Promise<AppAction> => {
        if (action.type !== 'LOAD_IMAGE') {
            throw new Error(`Wrong action type ${action.type}`);
        }
        const randomId = Math.random().toString();
        if ('url' in action) {
            return imageLoaded(await fileOrBlobToCanvas(action.url), randomId);
        }
        if ('file' in action) {
            return imageLoaded(await fileOrBlobToCanvas(action.file), randomId);
        }
        if ('image' in action) {
            return imageLoaded(action.image, randomId);
        }
        throw new Error(`LOAD_IMAGE action wrong properties ${Object.keys(action).join(',')}`);
    })
);

const onSearchSuccessShowResults: EpicConf = (action$) => action$.pipe(
    ofType('SEARCH_REQUEST_SUCCEED'),
    map(showResults)
);

const onSearchSuccessRedirectToSite: EpicConf = (action$, state$) => action$.pipe(
    ofType('SEARCH_REQUEST_SUCCEED'),
    withLatestFrom(state$),
    tap(([action, {settings}]) => {
        if (action.type !== 'SEARCH_REQUEST_SUCCEED' || !action.results || action.results.length !== 1) {
            return;
        }

        const firstLink = action.results[0].l;
        const instantRedirectPatterns = settings.instantRedirectPatterns;
        if (!instantRedirectPatterns.find(r => new RegExp(r).test(firstLink))) {
            return;
        }
        window.location.href = firstLink;
    }),
    ignoreElements()
);

const onSearchSuccessShowFeedbackDelayed: EpicConf = (action$) => action$.pipe(
    ofType('SEARCH_REQUEST_SUCCEED'),
    delay(3000),
    map(showFeedback)
);



const rootEpic = combineEpics(
    feedbackSuccessEpic,
    feedbackRegionEpic,
    feedbackClickEpic,
    historyEpic,
    imageSearch,
    regionSearch,
    startSearchOnImageLoaded,
    startSearchOnRegionsSuccessful,
    startSearchOnRegionChange,
    loadImage,
    onSearchSuccessShowResults,
    onSearchSuccessShowFeedbackDelayed,
    onSearchSuccessRedirectToSite
);

export default rootEpic;
