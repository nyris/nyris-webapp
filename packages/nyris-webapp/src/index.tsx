// Some people are still using internet explorer
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import { MuiThemeProvider } from '@material-ui/core';
import 'typeface-roboto';
import { HashRouter } from 'react-router-dom';
import Router from 'Router';
import { store } from 'Store/Store';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { createTheme } from '@material-ui/core/styles';
import { Toaster } from 'components/Toaster';

document.title = window.location.host;

let theme = createTheme({
  overrides: {
    MuiTooltip: {
      arrow: {
        color: 'black',
      },
      tooltip: {
        backgroundColor: 'black',
      },
    },
  },
});

ReactDOM.render(
  <Fragment>
    <Toaster />
    <Provider store={store}>
      <MuiThemeProvider theme={theme}>
        <HashRouter>
          <Router />
        </HashRouter>
      </MuiThemeProvider>
    </Provider>
  </Fragment>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
