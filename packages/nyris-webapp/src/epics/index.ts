import {combineEpics, ofType} from "redux-observable";
import {debounceTime, delay, ignoreElements, map, switchMap, tap, withLatestFrom} from "rxjs/operators";
import {showFeedback, showResults} from "../actions/nyrisAppActions";
import {EpicConf} from "./types";
import feedbackEpics from "./feedback";
import searchEpics from "./search";
import {searchOffersForImage, searchOffersForCad, searchRegions} from "../actions/searchActions";
import {AppAction} from "../types";
import {selectFirstCenteredRegion} from "@nyris/nyris-api";



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

const startSearchOnCadLoaded: EpicConf = (action$, state$) => action$.pipe(
    ofType('CAD_LOADED'),
    withLatestFrom(state$),
    switchMap(async ([action, {settings}]) : Promise<AppAction> => {
        if (action.type !== 'CAD_LOADED') {
            throw new Error(`Wrong action type ${action.type}`);
        }
        let { file } = action;
        return searchOffersForCad(file);
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

        let selection = selectFirstCenteredRegion(regions, 0.3, {x1: 0, x2: 1, y1: 0, y2: 1});
        return searchOffersForImage(requestImage.canvas, selection);
    })
);

const startSearchOnRegionsFailed: EpicConf = (action$, state$) => action$.pipe(
    ofType('REGION_REQUEST_FAIL'),
    withLatestFrom(state$),
    switchMap(async ([action, { search: { requestImage}}]) : Promise<AppAction> => {
        if (action.type !== 'REGION_REQUEST_FAIL') {
            throw new Error(`Wrong action type ${action.type}`);
        }
        if (!requestImage) {
            throw new Error(`No requestImage`);
        }

        return searchOffersForImage(requestImage.canvas);
    })
);

const startSearchOnRegionChange: EpicConf = (action$, state$) => action$.pipe(
    ofType('REGION_CHANGED'),
    debounceTime(1200),
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


const rootEpic = combineEpics(
    searchEpics,
    feedbackEpics,
    historyEpic,
    startSearchOnImageLoaded,
    startSearchOnCadLoaded,
    startSearchOnRegionsSuccessful,
    startSearchOnRegionsFailed,
    startSearchOnRegionChange,
    onSearchSuccessShowResults,
    onSearchSuccessShowFeedbackDelayed,
    onSearchSuccessRedirectToSite
);

export default rootEpic;
