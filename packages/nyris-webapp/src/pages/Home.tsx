import React, { useEffect, useState } from 'react';

import { twMerge } from 'tailwind-merge';

import DragDropFile from 'components/DragDropFile';
import MobileCameraCTA from 'components/MobileCameraCTA';
import TextSearch from 'components/TextSearch';
import CustomCamera from 'components/CustomCameraDrawer';
import ExperienceVisualSearchTrigger from 'components/ExperienceVisualSearch/ExperienceVisualSearchTrigger';
import { useNavigate } from 'react-router';

function Home() {
  const settings = window.settings;
  const { experienceVisualSearch, experienceVisualSearchImages } = settings;
  const navigate = useNavigate();

  const [experienceVisualSearchBlobs, setExperienceVisualSearchBlobs] =
    useState<Blob[]>([]);
  const [isOpenModalCamera, setOpenModalCamera] = useState<boolean>(false);

  const fetchImage = async (url: string) => {
    const response = await fetch(url, { cache: 'force-cache' });
    const blob = await response.blob();
    return blob;
  };

  useEffect(() => {
    document.title = settings.appTitle || '';

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
  }, [experienceVisualSearch, experienceVisualSearchImages, settings.appTitle]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const imageUrl = urlParams.get('imageUrl');
    if (imageUrl) {
      const queryParams = urlParams.toString();
      navigate(`/result?${queryParams}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <ExperienceVisualSearchTrigger
              experienceVisualSearchBlobs={experienceVisualSearchBlobs}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col desktop:hidden justify-center items-center w-full h-full bg-white">
        <MobileCameraCTA setOpenModalCamera={setOpenModalCamera} />
        <div className="box-screenshot-camera">
          <CustomCamera
            show={isOpenModalCamera}
            onClose={() => {
              setOpenModalCamera(s => !s);
            }}
          />
        </div>
        {settings.experienceVisualSearch && (
          <ExperienceVisualSearchTrigger
            experienceVisualSearchBlobs={experienceVisualSearchBlobs}
          />
        )}
        <div className="flex desktop:hidden w-full">
          <TextSearch className="flex md:hidden fixed bottom-12 w-full px-2 gap-2" />
        </div>
      </div>
    </>
  );
}

export default Home;
