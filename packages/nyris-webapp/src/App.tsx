import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import React from "react";
import "typeface-roboto";
import "index.css";
import { useAppSelector } from "Store/Store";
import LandingPageApp from "modules/LandingPage/indexApp";
import LandingPageAppMD from "modules/LandingPage/indexAppMD";
import AppNewVersion from "modules/LandingPage/indexNewVersion";
import {AppState} from "./types";

function App(): JSX.Element {
  const { settings } = useAppSelector<AppState>((state: any) => state);
  const { themePage }: any = settings;
  let SelectedApp = 
    themePage.default?.active ? LandingPageApp : (
      themePage.mdWhiteLabel?.active ? LandingPageAppMD : AppNewVersion);

  return <SelectedApp />;
}

export default App;
