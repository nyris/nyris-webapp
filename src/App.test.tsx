import React from 'react';
import ReactDOM from 'react-dom';
import App, { AppProps } from './App';
import  AppMD from './AppMD';
import {defaultMdSettings, defaultSettings} from "./defaults";


const appProps: AppProps = {
  search: {
    results: [],
    categoryPredictions: [],
    filterOptions: [],
    regions: [],
    codes: [],
    initialRect: { x1: 0, x2: 1, y1: 0, y2: 1}
  },
  loading: false,
  feedbackState: 'question',
  handlers: {
    onCameraClick: () => {},
    onCaptureCanceled: () => {},
    onCaptureComplete: () => {},
    onCloseFeedback: () => {},
    onExampleImageClick: () => {},
    onFileDropped: () => {},
    onImageClick: () => {},
    onLinkClick: () => {},
    onSelectFile: () => {},
    onShowStart: () => {},
    onSelectionChange: () => {},
    onPositiveFeedback: () => {},
    onNegativeFeedback: () => {},
  },
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
