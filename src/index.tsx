import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import {Provider} from 'react-redux';
import {applyMiddleware, createStore} from 'redux';
import thunk from 'redux-thunk';

enum AppViews {
    Start,
    Camera,
    Results
}

const settings = {
    "apiKey": "2cb25028c88b6ea01951374e",
    "maxWidth": 500,
    "maxHeight": 500,
    "jpegQuality": 0.9,
    "regions": true,
    "preview": true,
    "xOptions": "+estimated-category similarity.threshold=0.05 similarity.threshold.discard=0.05 exact.threshold.perfect=200 similarity.threshold.perfect=2 scoring.indicative-min-hits=1 scoring.promo-min-hits=20 scoring.interpolation-cutoff=0",
    "imageMatchingUrl": "https://api.nyris.io/find/v1/",
    "imageMatchingUrlBySku": "https://api.nyris.io/recommend/v1/",
    "imageMatchingSubmitManualUrl": "https://api.nyris.io/find/v1/manual/",
    "regionProposalUrl": "https://api.nyris.io/find/v1/regions/",
    "feedbackUrl": "https://api.nyris.io/feedback/v1/",
    "exampleImages": [
        "https://img.nyris.io/demo/everybag/kissen.jpg",
        "https://img.nyris.io/demo/everybag/aspirin.jpg",
        "https://img.nyris.io/demo/everybag/lego.jpg",
        "https://img.nyris.io/demo/everybag/wdr_add_2.jpg",
        "https://img.nyris.io/demo/everybag/mb-dle-4.jpg",
        "https://img.nyris.io/demo/everybag/1.jpg",
        "https://img.nyris.io/demo/everybag/5.jpg",
        "https://img.nyris.io/demo/everybag/6.jpg"
    ]
};

const initialState = {
    nyrisDesign: {
        view: AppViews.Start
    },
    search: {
        took: 0.123,
        requestId: 'blabab',
        results: [
            { title: 'bla',
                l: 'something',
                img: {url: 'https://img.nyris.io/demo/everybag/kissen.jpg'}},
            { title: 'bla',
                l: 'something',
                mer: 'blub',
                img: {url: 'https://img.nyris.io/demo/everybag/kissen.jpg'}},
        ],
    },
    settings
};

const dummyReducer = (state = initialState) => state;

const store = createStore(dummyReducer, applyMiddleware(thunk));

ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
