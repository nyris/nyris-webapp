import {EpicConf} from "./types";
import {combineEpics, ofType} from "redux-observable";
import {switchMap, withLatestFrom} from "rxjs/operators";
import {AppAction} from "../types";
import {ImageSearchOptions, urlOrBlobToCanvas, isCadFile, isImageFile} from "@nyris/nyris-api";
import {imageLoaded, cadFileLoaded} from "../actions/searchActions";

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
            console.warn('search failed', e);
            return ({ type: 'SEARCH_REQUEST_FAIL', reason: e.message, exception: e });
        }
    })
);

const cadSearch: EpicConf = (action$, state$, {api}) => action$.pipe(
    ofType('CAD_SEARCH_REQUEST_START'),
    withLatestFrom(state$),
    switchMap(async ([action, {settings}]) : Promise<AppAction> => {
        if (action.type !== 'CAD_SEARCH_REQUEST_START') {
            throw new Error(`Wrong action type ${action.type}`);
        }

        let { file } = action;

        let options : ImageSearchOptions = { };

        try {
            const {results, duration, requestId, categoryPredictions, codes} = await api.findByCad(file, options);
            return ({ type: 'SEARCH_REQUEST_SUCCEED', results, requestId, duration, categoryPredictions, codes });
        } catch (e) {
            console.warn('search failed', e);
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

const loadFile: EpicConf = (action$) => action$.pipe(
    ofType('LOAD_FILE'),
    switchMap(async (action) : Promise<AppAction> => {
        if (action.type !== 'LOAD_FILE') {
            throw new Error(`Wrong action type ${action.type}`);
        }
        const randomId = Math.random().toString();
        if ('file' in action) {
            const file = action.file;
            if (isImageFile(file)) {
                return imageLoaded(await urlOrBlobToCanvas(file), randomId);
            }
            if (isCadFile(file)) {
                return cadFileLoaded(file, randomId);
            }
        }
        throw new Error(`LOAD_FILE action wrong properties ${Object.keys(action).join(',')}`);
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
            return imageLoaded(await urlOrBlobToCanvas(action.url), randomId);
        }
        if ('file' in action) {
            return imageLoaded(await urlOrBlobToCanvas(action.file), randomId);
        }
        if ('image' in action) {
            return imageLoaded(action.image, randomId);
        }
        throw new Error(`LOAD_IMAGE action wrong properties ${Object.keys(action).join(',')}`);
    })
);

export default combineEpics(
    cadSearch,
    imageSearch,
    regionSearch,
    loadFile,
    loadImage);
