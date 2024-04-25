import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import 'typeface-roboto';
import 'index.css';

import { useMediaQuery } from 'react-responsive';
import AppMD from 'page/landingPage/AppMD';
import AppMobile from 'page/landingPage/AppMobile';

function App(): JSX.Element {
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  let SelectedApp: any = isMobile ? AppMobile : AppMD;

  return <SelectedApp />;
}

export default App;
