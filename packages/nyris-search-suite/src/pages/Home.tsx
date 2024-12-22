import React from 'react';

import { twMerge } from 'tailwind-merge';

import DragDropFile from 'components/DragDropFile';
import MobileCameraCTA from 'components/MobileCameraCTA';
import TextSearch from 'components/TextSearch';

function Home() {
  const settings = window.settings;

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
          {/* todo-search-suite */}
          {/* {settings.experienceVisualSearch ? (
            <ExperienceVisualSearch
              experienceVisualSearchBlobs={experienceVisualSearchBlobs}
            />
          ) : (
            ''
          )} */}
        </div>
      </div>

      <div className="flex desktop:hidden justify-center items-center w-full h-full">
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
        {/* todo-search-suite */}
        {/* {settings.experienceVisualSearch && (
          <ExperienceVisualSearch
            experienceVisualSearchBlobs={experienceVisualSearchBlobs}
          />
        ) } */}
      </div>
    </>
  );
}

export default Home;
