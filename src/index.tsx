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
    searchImage
} from './actions/searchActions';
import {fileOrBlobToCanvas, toCanvas} from "./nyris";
import {composeWithDevTools} from "redux-devtools-extension";
import {SearchServiceSettings} from "./types";

export enum AppViews {
    Start = 'START',
    Camera = 'CAMERA',
    Results = 'RESULTS'
}

declare var settings : SearchServiceSettings;


const withConsoleLogger = (reducer: Reducer) => (
    (state: any, action: any) => {
        console.log("reducer called with action", action);
        return reducer(state, action);
    }
);


const rootReducer = (
    combineReducers({
    nyrisDesign: () => ({
        view: AppViews.Start
    }),
    settings: () => settings as SearchServiceSettings,
    search: withConsoleLogger(searchReducer)
}));


const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk as ThunkMiddleware<any, any>)));


type AppState = {
    search: SearchState,
    settings: SearchServiceSettings,
    [key: string]: any // TODO
};


const mapStateToProps = (state: AppState) => ({
    view: state.nyrisDesign.view,
    search: {
        results: state.search.results,
        categoryPredictions: state.search.categoryPredictions,
        filterOptions: state.search.filterOptions
    },
    settings: state.settings,
    loading: state.search.fetchingRegions || state.search.fetchingResults
});

const mapDispatchToProps = (dispatch: ThunkDispatch<any, {}, AnyAction>)  => ({
    handlers: {
        onPositiveFeedback: () => console.log('on positive feedback'),
        onNegativeFeedback: () => console.log('on negative feedback'),
        onSelectFile: async (file: File) => {
            console.log('onSelectFile');
            const canvas = await fileOrBlobToCanvas(file);
            console.log('onSelectFile', canvas);
            await dispatch(searchImage(canvas));
        },
        onExampleImageClicked: async (img: HTMLImageElement) => {
            console.log('on example image clicked', img);
            try {
                const canvas = await toCanvas(img);
                console.log('-> on example image clicked', canvas);
                await dispatch(searchImage(canvas));
            } catch (e) {
                console.error(e)

            }
        },
        onFileDropped: async (file: File) => {
            console.log('onFileDropped');
            const canvas = await fileOrBlobToCanvas(file);
            console.log('onSelectFile', canvas);
            await dispatch(searchImage(canvas));
        }
    }
});


const ConnectedApp = connect(mapStateToProps, mapDispatchToProps)(App);

ReactDOM.render(<Provider store={store}><ConnectedApp/></Provider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
