import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import React from "react";
import "typeface-roboto";
import "index.css";
import { useAppSelector } from "Store/Store";
import LandingPageApp from "modules/LandingPage/index";
import AppNewVersion from "modules/LandingPage/indexNewVersion";
import {AppState} from "./types";

function App(): JSX.Element {
  const { settings } = useAppSelector<AppState>((state: any) => state);
  const { themePage } = settings;
  let SelectedApp = themePage.searchSuite?.active ? AppNewVersion : LandingPageApp;

  return <SelectedApp />;
}

export default App;
