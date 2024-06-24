// Some people are still using internet explorer
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import ReactDOM from 'react-dom/client';
import React, { Fragment } from 'react';
import './index.css';
import { Provider } from 'react-redux';
import { MuiThemeProvider } from '@material-ui/core';
import 'typeface-roboto';
import { BrowserRouter } from 'react-router-dom';
import Router from 'Router';
import { store } from 'Store/Store';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { createTheme } from '@material-ui/core/styles';
import { Toaster } from 'components/Toaster';
import AuthProvider from 'components/Provider/AuthProvider';

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

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <Fragment>
    <Toaster />
    <Provider store={store}>
      <AuthProvider>
        <MuiThemeProvider theme={theme}>
          <BrowserRouter>
            <Router />
          </BrowserRouter>
        </MuiThemeProvider>
      </AuthProvider>
    </Provider>
  </Fragment>,
);
