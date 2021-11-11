// Some people are still using internet explorer
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import AppMD from './AppMD';
import * as serviceWorker from './serviceWorker';

import {connect, Provider} from 'react-redux';
import {applyMiddleware, bindActionCreators, combineReducers, createStore, Dispatch} from 'redux';
import {
    loadCanvas,
    loadFile,
    loadUrl,
    reducer as searchReducer,
    selectionChanged, submitNegativeFeedback, submitPositiveFeedback
} from './actions/searchActions';
import {
    hideFeedback,
    reducer as nyrisReducer,
    showCamera,
    showStart
} from './actions/nyrisAppActions';
import { getUrlParam } from "./utils";
import {composeWithDevTools} from "redux-devtools-extension";
import {AppAction, AppSettings, AppState, MDSettings} from "./types";
import {createEpicMiddleware} from "redux-observable";
import NyrisAPI from "@nyris/nyris-api";
import {createMuiTheme, MuiThemeProvider} from "@material-ui/core";
import 'typeface-roboto';
import {defaultMdSettings, defaultSettings} from "./defaults";
import rootEpic from "./epics";
import { createHashHistory } from 'history';


declare var settings: AppSettings;


function scrollTop() {
    // TODO might require polyfill for ios and edge
    window.scrollTo({top: 0, left: 0, behavior: "smooth"});
}



let normalizedSettings : AppSettings = {
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
    settings: () => normalizedSettings as AppSettings,
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
        codes: state.search.codes,
        filterOptions: state.search.filterOptions,
        previewSelection: state.search.selectedRegion,
        regions: state.search.regions,
        duration: state.search.duration,
        requestId: state.search.requestId,
        toastErrorMessage: state.search.errorMessage
    },
    settings: state.settings,
    previewImage: state.search.requestImage,
    loading: state.search.fetchingRegions || state.search.fetchingResults,
    feedbackState: state.nyrisDesign.feedbackState,
    mdSettings: state.settings.materialDesign || defaultMdSettings,
});


const mapDispatchToProps = (dispatch: Dispatch<AppAction>) => {
    return {
        handlers: {
            ...bindActionCreators({
                onPositiveFeedback: submitPositiveFeedback,
                onNegativeFeedback: submitNegativeFeedback,
                onCameraClick: showCamera,
                onCaptureCanceled: showStart,
                onCaptureComplete: loadCanvas,
                onSelectFile: loadFile,
                onExampleImageClick: loadUrl,
                onFileDropped: loadFile,
                onSelectionChange: selectionChanged,
                onCloseFeedback: hideFeedback,
            }, dispatch),
            onImageClick: (position: number, url: string) => {
                dispatch({ type: "RESULT_IMAGE_CLICKED", position, url});
                dispatch(loadUrl(url));
            },
            onLinkClick: (position: number, url: string) => {
                dispatch({type: 'RESULT_LINK_CLICKED', position, url});
                if (url) {
                    window.open(url);
                }
            },
            onShowStart: () => {
                dispatch(showStart());
                scrollTop();
            },
        }
    };
};


// chrome plugin communication
function onMessage(evt: MessageEvent) {
    let msg = evt.data;
    if (msg.type === "image")  {
        store.dispatch(loadUrl(msg.image));
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
