import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import 'typeface-roboto';
import 'index.css';

import { useMediaQuery } from 'react-responsive';
import AppMD from 'page/landingPage/AppMD';
import AppMobile from 'page/landingPage/AppMobile';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useAppSelector } from 'Store/Store';
import { translations } from 'translations';

i18n.use(initReactI18next).init({
  resources: translations,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

function App(): JSX.Element {
  const language = useAppSelector(state => state.settings.language);

  i18n.changeLanguage(language);

  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  let SelectedApp: any = isMobile ? AppMobile : AppMD;

  return <SelectedApp />;
}

export default App;
