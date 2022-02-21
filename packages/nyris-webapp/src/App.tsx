import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import React from "react";
import "typeface-roboto";
import "index.css";
import { useAppSelector } from "Store/Store";
import LandingPageApp from "modules/LandingPage/indexApp";
import LandingPageAppMD from "modules/LandingPage/indexAppMD";

function App(): JSX.Element {
  const { settings } = useAppSelector((state) => state);
  let useMd = settings.materialDesign !== undefined;
  const SelectedApp = useMd ? LandingPageAppMD : LandingPageApp;

  return <SelectedApp />;
}

export default App;
