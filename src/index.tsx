import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import {connect, Provider} from 'react-redux';
import {applyMiddleware, combineReducers, createStore, Reducer} from 'redux';
import thunk, {ThunkDispatch, ThunkMiddleware} from 'redux-thunk';
import {
    reducer as searchReducer, selectImage,
    selectionChanged
} from './actions/searchActions';
import {reducer as nyrisReducer} from './actions/nyrisAppActions';
import {fileOrBlobToCanvas, toCanvas} from "./nyris";
import {composeWithDevTools} from "redux-devtools-extension";
import {AppAction, AppState, RectCoords, Region, SearchServiceSettings} from "./types";
import {Subject} from "rxjs";
import {debounceTime, ignoreElements, tap, withLatestFrom} from "rxjs/operators";
import {combineEpics, createEpicMiddleware, Epic, ofType} from "redux-observable";
import NyrisAPI from "./NyrisAPI";


declare var settings : SearchServiceSettings;



function scrollTop() {
    // TODO might require polyfil for ios and edge
    window.scrollTo({top: 0,  left: 0, behavior: "smooth"});
}



// feedback api
const feedbackSuccessEpic : Epic<AppAction, AppAction, AppState> = (action$, state$, { api }) => action$.pipe(
    ofType('FEEDBACK_SUBMIT_POSITIVE', "FEEDBACK_SUBMIT_NEGATIVE"),
    withLatestFrom(state$),
    tap(async ([{ type }, state]) => {
        const success = type === 'FEEDBACK_SUBMIT_POSITIVE';
        await api.sendFeedback(state.search.sessionId, state.search.requestId, {
            event: 'feedback', data: { success }
        });
    }),
    ignoreElements()
);

const feedbackRegionEpic : Epic<AppAction, AppAction, AppState> = (action$, state$, { api }) => action$.pipe(
    ofType('REGION_CHANGED'),
    withLatestFrom(state$),
    tap(async ([action, state]) => {
        console.log('region changed')
        if (action.type === 'REGION_CHANGED') {
            let { region: {x1, x2, y1, y2} } =  action;
            await api.sendFeedback(state.search.sessionId, state.search.requestId, {
                event: 'region', data: { rect: { x: x1, y: y1, w: x2-x1, h: y2-y1 } }
            });
        }
    }),
    ignoreElements()
);

const rootEpic = combineEpics(
    feedbackSuccessEpic,
    feedbackRegionEpic
);

let api = new NyrisAPI(settings);

const epicMiddleware = createEpicMiddleware<AppAction,AppAction, AppState>({
    dependencies: { api }
});


const withConsoleLogger = (reducer: Reducer) => (
    (state: any, action: any) => {
        console.log("reducer called with action", action);
        return reducer(state, action);
    }
);


const rootReducer = combineReducers({
    settings: () => settings as SearchServiceSettings,
    nyrisDesign: nyrisReducer,
    search: withConsoleLogger(searchReducer)
});


const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(epicMiddleware), applyMiddleware(thunk as ThunkMiddleware<any, any>)));
epicMiddleware.run(rootEpic);


const mapStateToProps = (state: AppState) => ({
    showPart: state.nyrisDesign.showPart,
    search: {
        results: state.search.results,
        categoryPredictions: state.search.categoryPredictions,
        filterOptions: state.search.filterOptions,
        initialRegion: state.search.regions.length > 0 ? state.search.regions[0] : { x1: 0.1, y1: 0.1, x2: 0.9, y2: 0.9  },
        regions: state.search.regions,
        duration: state.search.duration,
        requestId: state.search.requestId
    },
    settings: state.settings,
    previewImage: state.search.requestImage instanceof HTMLCanvasElement ? state.search.requestImage : undefined,
    loading: state.search.fetchingRegions || state.search.fetchingResults,
    feedbackState: state.nyrisDesign.feedbackState
});

const feedbackTimeout = 4000;

const mapDispatchToProps = (dispatch: ThunkDispatch<AppState, {}, AppAction>)  => {
    let changeEmitter = new Subject();
    changeEmitter.pipe(debounceTime(600)).subscribe(e => {
        console.log('selection changed', e);
        return dispatch(selectionChanged(e as RectCoords));
    });
    return {
        handlers: {
            onPositiveFeedback: () => {
                dispatch({ type: 'FEEDBACK_SUBMIT_POSITIVE'});
            },
            onNegativeFeedback: () => {
                dispatch({ type: 'FEEDBACK_SUBMIT_NEGATIVE'});
            },
            onSelectFile: async (file: File) => {
                console.log('onSelectFile');
                const canvas = await fileOrBlobToCanvas(file);
                console.log('onSelectFile', canvas);
                await dispatch(selectImage(canvas));
            },
            onImageClick: async (e: Event) => {
                let img = e.target as HTMLImageElement;
                console.log('on example image clicked', img);
                try {
                    dispatch(({ type: 'SHOW_RESULTS'}));
                    console.log('-> on example image clicked', img);
                    const canvas = await toCanvas(img);
                    console.log('-> on example image clicked', canvas);
                    await dispatch(selectImage(canvas));
                    setTimeout(() => { dispatch({type: 'SHOW_FEEDBACK'})},feedbackTimeout)
                } catch (e) {
                    console.error(e)

                }
            },
            onLinkClick: async (result: any) => {
                console.log('result clicked', result);
                if (result.l) {
                    window.open(result.l);
                }
            },
            onFileDropped: async (file: File) => {
                console.log('onFileDropped');
                dispatch(({ type: 'SHOW_RESULTS'}));
                const canvas = await fileOrBlobToCanvas(file);
                console.log('onSelectFile', canvas);
                await dispatch(selectImage(canvas));
                setTimeout(() => { dispatch({type: 'SHOW_FEEDBACK'})},feedbackTimeout)
            },
            onSelectionChange: (selection: Region) => {
                changeEmitter.next(selection);
            },
            onShowStart: () => {
                dispatch({type: 'SHOW_START'});
                scrollTop();
            },
            onCloseFeedback: () => {
                dispatch({type: 'HIDE_FEEDBACK'});
            }
        }
    };
};


const ConnectedApp = connect(mapStateToProps, mapDispatchToProps)(App);

ReactDOM.render(<Provider store={store}><ConnectedApp/></Provider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
