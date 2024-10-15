import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React, { useEffect } from 'react';
import 'typeface-roboto';
import 'index.css';

import AppMD from 'page/landingPage/HomeDesktop';
import AppMobile from 'page/landingPage/HomeMobile';
import { useAppSelector } from 'Store/Store';

function Home(): JSX.Element {
  const clarityId = useAppSelector(state => state.settings.clarityId);

  useEffect(() => {
    if (clarityId) {
      clarify(window, document, 'clarity', 'script', clarityId);
    }
  }, [clarityId]);

  const clarify = function (
    c: any,
    l: Document,
    a: string,
    r: string,
    i: string,
  ) {
    c[a] =
      c[a] ||
      function () {
        (c[a].q = c[a].q || []).push(arguments);
      };
    const t: any = l.createElement(r);
    t.async = true;
    t.src = `https://www.clarity.ms/tag/${i}`;
    const y = l.getElementsByTagName(r)[0];
    if (y.parentNode) {
      y.parentNode.insertBefore(t, y);
    }
  };

  return (
    <>
      <AppMobile />
      <AppMD />
    </>
  );
}

export default Home;
