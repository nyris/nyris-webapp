import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Router from './Router';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';

interface IAuth0 {
  domain: string;
  clientId: string;
}

interface INyrisSettings {
  id: string;
  logo: string;
  auth0: IAuth0;
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
    <Auth0Provider
      domain={window.NyrisSettings.auth0.domain || ''}
      clientId={window.NyrisSettings.auth0.clientId || ''}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
);
