import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Router from './Router';
import { BrowserRouter } from 'react-router-dom';

interface INyrisSettings {
  id: string;
  logo: string;
}

declare global {
  interface Window {
    NyrisSettings: INyrisSettings;
  }
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  </React.StrictMode>
);
