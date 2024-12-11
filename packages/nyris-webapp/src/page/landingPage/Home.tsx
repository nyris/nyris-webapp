import React, { useEffect, useState } from 'react';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'typeface-roboto';
import 'index.css';

import AppMD from 'page/landingPage/HomeDesktop';
import AppMobile from 'page/landingPage/HomeMobile';
import { useAppSelector } from 'Store/Store';

function Home(): JSX.Element {
  const experienceVisualSearch = useAppSelector(
    state => state.settings.experienceVisualSearch,
  );
  const experienceVisualSearchImages = useAppSelector(
    state => state.settings.experienceVisualSearchImages,
  );

  // const clarityId = useAppSelector(state => state.settings.clarityId);

  // useEffect(() => {
  //   if (clarityId) {
  //     clarify(window, document, 'clarity', 'script', clarityId);
  //   }
  // }, [clarityId]);

  // const clarify = function (
  //   c: any,
  //   l: Document,
  //   a: string,
  //   r: string,
  //   i: string,
  // ) {
  //   c[a] =
  //     c[a] ||
  //     function () {
  //       (c[a].q = c[a].q || []).push(arguments);
  //     };
  //   const t: any = l.createElement(r);
  //   t.async = true;
  //   t.src = `https://www.clarity.ms/tag/${i}`;
  //   const y = l.getElementsByTagName(r)[0];
  //   if (y.parentNode) {
  //     y.parentNode.insertBefore(t, y);
  //   }
  // };

  const [experienceVisualSearchBlobs, setExperienceVisualSearchBlobs] =
    useState<Blob[]>([]);

  const fetchImage = async (url: string) => {
    const response = await fetch(url, { cache: 'force-cache' });
    const blob = await response.blob();
    return blob;
  };

  useEffect(() => {
    const fetchAllImages = async () => {
      if (experienceVisualSearch && experienceVisualSearchImages?.length) {
        const randomImages = experienceVisualSearchImages?.slice(
          0,
          Math.min(experienceVisualSearchImages?.length, 4),
        );
        try {
          // randomImages.forEach(url => {
          //   fetchImage(url).then(value => {
          //     setExperienceVisualSearchBlobs(s => [...s, value]);
          //   });
          // });

          const responses = await Promise.all(
            randomImages.map(url => fetchImage(url)),
          );
          setExperienceVisualSearchBlobs(responses);
        } catch (error) {
          console.error('Error fetching images:', error);
        }
      }
    };

    fetchAllImages();
  }, [experienceVisualSearch, experienceVisualSearchImages]);

  return (
    <>
      <AppMobile experienceVisualSearchBlobs={experienceVisualSearchBlobs} />
      <AppMD experienceVisualSearchBlobs={experienceVisualSearchBlobs} />
    </>
  );
}

export default Home;
