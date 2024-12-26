import React, { useEffect, useState } from 'react';

import { twMerge } from 'tailwind-merge';

import DragDropFile from 'components/DragDropFile';
import MobileCameraCTA from 'components/MobileCameraCTA';
import TextSearch from 'components/TextSearch';
import ExperienceVisualSearch from 'components/ExperienceVisualSearch/ExperienceVisualSearch';

function Home() {
  const settings = window.settings;
  const { experienceVisualSearch, experienceVisualSearchImages } = settings;

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
      <div
        className={twMerge([
          'relative',
          'hidden desktop:flex',
          'flex-col',
          'items-center',
          'justify-center',
          'h-auto',
          'mt-[calc(50vh-75px)]',
          'bg-[#fafafa]',
        ])}
      >
        <div className="relative flex flex-col items-center justify-center w-full">
          {settings.headerText && (
            <div
              className={twMerge([
                'absolute',
                'bottom-[49px]',
                'text-primary',
                'font-bold',
              ])}
            >
              <h1 className="text-[25px]">{settings.headerText}</h1>
            </div>
          )}
          <div className="w-[427px]">
            <TextSearch />
          </div>
        </div>
        <div className="max-w-[512px] relative w-full">
          <DragDropFile />
          {settings.experienceVisualSearch && (
            <ExperienceVisualSearch
              experienceVisualSearchBlobs={experienceVisualSearchBlobs}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col desktop:hidden justify-center items-center w-full h-full bg-white">
        <MobileCameraCTA />
        <div className="box-screenshot-camera">
          {/* todo-search-suite */}
          {/* <CameraCustom
            show={isOpenModalCamera}
            onClose={() => {
              setOpenModalCamera(!isOpenModalCamera);
            }}
          /> */}
        </div>
        {settings.experienceVisualSearch && (
          <ExperienceVisualSearch
            experienceVisualSearchBlobs={experienceVisualSearchBlobs}
          />
        )}
      </div>
    </>
  );
}

export default Home;
