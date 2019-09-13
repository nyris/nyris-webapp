import React from 'react';
import ReactDOM from 'react-dom';
import App, {AppMD, AppProps} from './App';
import {defaultMdSettings, defaultSettings} from "./defaults";


const appProps: AppProps = {
  search: {
    results: [],
    categoryPredictions: [],
    filterOptions: [],
    regions: [],
    initialRegion: { x1: 0, x2: 1, y1: 0, y2: 1}
  },
  loading: false,
  feedbackState: 'question',
  handlers: {},
  showPart: 'start',
  settings: { ...defaultSettings },
  mdSettings: defaultMdSettings,
};

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App { ...appProps} />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('renders material design version without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<AppMD { ...appProps} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
