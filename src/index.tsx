import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App, {AppMD} from './App';
import * as serviceWorker from './serviceWorker';

import {connect, Provider} from 'react-redux';
import {applyMiddleware, combineReducers, createStore, Dispatch, Reducer} from 'redux';
import {
    reducer as searchReducer, selectImage,
    selectionChanged
} from './actions/searchActions';
import {
    hideFeedback,
    reducer as nyrisReducer,
    showCamera,
    showFeedback,
    showResults,
    showStart
} from './actions/nyrisAppActions';
import {fileOrBlobToCanvas, getUrlParam, toCanvas} from "./nyris";
import {composeWithDevTools} from "redux-devtools-extension";
import {AppAction, AppState, MDSettings, RectCoords, Region, SearchServiceSettings} from "./types";
import {createEpicMiddleware} from "redux-observable";
import NyrisAPI from "./NyrisAPI";
import {createMuiTheme, MuiThemeProvider} from "@material-ui/core";
import 'typeface-roboto';
import {defaultMdSettings, defaultSettings} from "./defaults";
import rootEpic from "./epics";
import { createHashHistory } from 'history';


declare var settings: SearchServiceSettings;


function scrollTop() {
    // TODO might require polyfil for ios and edge
    window.scrollTo({top: 0, left: 0, behavior: "smooth"});
}



let normalizedSettings : SearchServiceSettings = {
    ...defaultSettings,
    ...settings,
};

normalizedSettings = {
    ...normalizedSettings,
    apiKey: getUrlParam('apiKey') as string || normalizedSettings.apiKey,
    xOptions: getUrlParam('xOptions') as string || normalizedSettings.xOptions,
    regions: getUrlParam('use.regions') as boolean || normalizedSettings.regions,
    preview: getUrlParam('use.preview') as boolean || normalizedSettings.preview,

};

document.title = window.location.host;

const api = new NyrisAPI(normalizedSettings);
const history = createHashHistory();

const epicMiddleware = createEpicMiddleware<AppAction, AppAction, AppState>({
    dependencies: {api, history}
});

const rootReducer = combineReducers({
    settings: () => normalizedSettings as SearchServiceSettings,
    nyrisDesign: nyrisReducer,
    search: searchReducer
});


const store = createStore(rootReducer, composeWithDevTools(
    applyMiddleware(epicMiddleware)
));
epicMiddleware.run(rootEpic);



history.listen((location, action) => {
    console.log('history', location, action)
    if (action === 'PUSH') {
        return;
    }
    switch (location.pathname) {
        case '/results':
            store.dispatch({type: 'SHOW_RESULTS'});
            break;
        case '/':
            store.dispatch({type: 'SHOW_START'});
            break;
    }
});


// Here comes the really dirty code of the composition-root

const mapStateToProps = (state: AppState) => ({
    showPart: state.nyrisDesign.showPart,
    search: {
        results: state.search.results,
        categoryPredictions: state.search.categoryPredictions,
        filterOptions: state.search.filterOptions,
        initialRegion: state.search.regions.length > 0 ? state.search.regions[0] : {x1: 0.1, y1: 0.1, x2: 0.9, y2: 0.9},
        regions: state.search.regions,
        duration: state.search.duration,
        requestId: state.search.requestId
    },
    settings: state.settings,
    previewImage: state.search.requestImage instanceof HTMLCanvasElement ? state.search.requestImage : undefined,
    loading: state.search.fetchingRegions || state.search.fetchingResults,
    feedbackState: state.nyrisDesign.feedbackState,
    mdSettings: state.settings.materialDesign || defaultMdSettings
});

const feedbackTimeout = 4000;

const mapDispatchToProps = (dispatch: Dispatch<AppAction>) => {
    return {
        handlers: {
            onPositiveFeedback: () => {
                dispatch({type: 'FEEDBACK_SUBMIT_POSITIVE'});
            },
            onNegativeFeedback: () => {
                dispatch({type: 'FEEDBACK_SUBMIT_NEGATIVE'});
            },
            onCameraClick: () => {
                dispatch(showCamera());
            },
            onCaptureCanceled: () => {
                dispatch(showStart());
            },
            onCaptureComplete: (canvas: HTMLCanvasElement) => {
                (async () => {
                    await dispatch(showResults());
                    await dispatch(selectImage(canvas));
                })()
            },
            onSelectFile: (file: File) => {
                (async () => {
                    console.log('onSelectFile');
                    const canvas = await fileOrBlobToCanvas(file);
                    console.log('onSelectFile', canvas);
                    await dispatch(selectImage(canvas));
                })()
            },
            onImageClick: (position: number, url: string) => {
                (async () => {
                    dispatch({ type: "RESULT_IMAGE_CLICKED", position, url});
                    let img = await fileOrBlobToCanvas(url);
                    console.log('on image clicked', img);
                    try {
                        dispatch(showResults());
                        console.log('-> on example image clicked', img);
                        const canvas = await toCanvas(img);
                        console.log('-> on example image clicked', canvas);
                        await dispatch(selectImage(canvas));
                        setTimeout(() => {
                            dispatch(showFeedback())
                        }, feedbackTimeout)
                    } catch (e) {
                        console.error(e)

                    }
                })()
            },
            onExampleImageClick: (url: string) => {
                (async () => {
                    let img = await fileOrBlobToCanvas(url); // TODO this is sketchy
                    console.log('on image clicked', img);
                    try {
                        dispatch(showResults());
                        console.log('-> on example image clicked', img);
                        const canvas = await toCanvas(img);
                        console.log('-> on example image clicked', canvas);
                        await dispatch(selectImage(canvas));
                        setTimeout(() => {
                            dispatch(showFeedback())
                        }, feedbackTimeout)
                    } catch (e) {
                        console.error(e)

                    }
                })()
            },
            onLinkClick: (position: number, url: string) => {
                console.log('result clicked', position);
                dispatch({type: 'RESULT_LINK_CLICKED', position, url});
                if (url) {
                    window.open(url);
                }
            },
            onFileDropped: (file: File) => {
                (async () => {
                    console.log('onFileDropped');
                    dispatch(showResults());
                    const canvas = await fileOrBlobToCanvas(file);
                    console.log('onSelectFile', canvas);
                    await dispatch(selectImage(canvas));
                    setTimeout(() => {
                        dispatch(showFeedback())
                    }, feedbackTimeout)
                })()
            },
            onSelectionChange: (region: Region) => {
                dispatch(selectionChanged(region));
            },
            onShowStart: () => {
                dispatch(showStart());
                scrollTop();
            },
            onCloseFeedback: () => {
                dispatch(hideFeedback());
            }
        }
    };
};


// chrome plugin communication
async function onMessage(evt: MessageEvent) {
    let msg = evt.data;
    if (msg.type === "image")  {
        let canvas = await fileOrBlobToCanvas(msg.image);
        await store.dispatch(selectImage(canvas));
    }
}
window.addEventListener('message', onMessage);




let useMd = settings.materialDesign !== undefined;
let md: MDSettings = {
    ...defaultMdSettings,
    ...settings.materialDesign
};
let theme = createMuiTheme({
    typography: {
        fontFamily: md.customFontFamily,
    },
    palette: {
        primary: {
            main: md.primaryColor,
        },
        secondary: {
            main: md.secondaryColor
        }
    }
});
const SelectedApp = useMd ? AppMD : App;
const ConnectedApp = connect(mapStateToProps, mapDispatchToProps)(SelectedApp);

ReactDOM.render(<Provider store={store}><MuiThemeProvider
    theme={theme}><ConnectedApp/></MuiThemeProvider></Provider>, document.getElementById('root'));





// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
