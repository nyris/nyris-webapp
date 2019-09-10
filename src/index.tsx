import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import {connect, Provider} from 'react-redux';
import {AnyAction, applyMiddleware, combineReducers, createStore, Reducer} from 'redux';
import thunk, {ThunkDispatch, ThunkMiddleware} from 'redux-thunk';
import {
    reducer as searchReducer, SearchState,
    searchImage, SearchAction
} from './actions/searchActions';
import {NyrisAction, reducer as nyrisReducer} from './actions/nyrisAppActions';
import {fileOrBlobToCanvas, toCanvas} from "./nyris";
import {composeWithDevTools} from "redux-devtools-extension";
import {Region, SearchServiceSettings} from "./types";
import {Subject} from "rxjs";
import {debounceTime} from "rxjs/operators";
import {NyrisAppState} from "./actions/nyrisAppActions";


declare var settings : SearchServiceSettings;


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


const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk as ThunkMiddleware<any, any>)));


function scrollTop() {
    // TODO might require polyfil for ios and edge
    window.scrollTo({top: 0,  left: 0, behavior: "smooth"});
}


type AppState = {
    search: SearchState,
    settings: SearchServiceSettings,
    nyrisDesign: NyrisAppState
};

type AppAction =
    | SearchAction
    | NyrisAction


const mapStateToProps = (state: AppState) => ({
    showPart: state.nyrisDesign.showPart,
    search: {
        results: state.search.results,
        categoryPredictions: state.search.categoryPredictions,
        filterOptions: state.search.filterOptions,
        initialRegion: state.search.regions.length > 0 ? state.search.regions[0].region : { left: 0.1, top: 0.1, right: 0.1, bottom: 0.1  },
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
    });
    return {
        handlers: {
            onPositiveFeedback: () => console.log('on positive feedback'),
            onNegativeFeedback: () => console.log('on negative feedback'),
            onSelectFile: async (file: File) => {
                console.log('onSelectFile');
                const canvas = await fileOrBlobToCanvas(file);
                console.log('onSelectFile', canvas);
                await dispatch(searchImage(canvas));
            },
            onImageClicked: async (img: HTMLImageElement) => {
                console.log('on example image clicked', img);
                try {
                    console.log('-> on example image clicked', img);
                    const canvas = await toCanvas(img);
                    console.log('-> on example image clicked', canvas);
                    await dispatch(searchImage(canvas));
                    dispatch(({ type: 'SHOW_RESULTS'}));
                    setTimeout(() => { dispatch({type: 'SHOW_FEEDBACK'})},feedbackTimeout)
                } catch (e) {
                    console.error(e)

                }
            },
            onFileDropped: async (file: File) => {
                console.log('onFileDropped');
                const canvas = await fileOrBlobToCanvas(file);
                console.log('onSelectFile', canvas);
                await dispatch(searchImage(canvas));
                dispatch(({ type: 'SHOW_RESULTS'}));
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
