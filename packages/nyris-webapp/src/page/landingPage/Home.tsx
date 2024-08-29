import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import 'typeface-roboto';
import 'index.css';

import AppMD from 'page/landingPage/HomeDesktop';
import AppMobile from 'page/landingPage/HomeMobile';

function Home(): JSX.Element {
  return (
    <>
      <AppMobile />
      <AppMD />
    </>
  );
}

export default Home;
