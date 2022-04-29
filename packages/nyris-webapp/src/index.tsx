// Some people are still using internet explorer
import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { Provider } from "react-redux";
import { AppSettings, MDSettings } from "./types";
import { MuiThemeProvider } from "@material-ui/core";
import "typeface-roboto";
import { defaultMdSettings } from "./defaults";
import { HashRouter } from "react-router-dom";
import Router from "Router";
import { store } from "Store/Store";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { createTheme } from "@material-ui/core/styles";
declare var settings: AppSettings;

document.title = window.location.host;

let md: MDSettings = {
  ...defaultMdSettings,
  ...settings.materialDesign,
};

let theme = createTheme({
  typography: {
    fontFamily: md.customFontFamily,
  },
  palette: {
    primary: {
      main: md.primaryColor,
    },
    secondary: {
      main: md.secondaryColor,
    },
  },
});

ReactDOM.render(
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <HashRouter>
        <Router />
      </HashRouter>
    </MuiThemeProvider>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
