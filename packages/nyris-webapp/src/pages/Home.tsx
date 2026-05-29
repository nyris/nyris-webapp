import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import DragDropFile from 'components/DragDropFile';
import MobileCameraCTA from 'components/MobileCameraCTA';
import TextSearch from 'components/TextSearch';
import CustomCamera from 'components/CustomCameraDrawer';
import ExperienceVisualSearchTrigger from 'components/ExperienceVisualSearch/ExperienceVisualSearchTrigger';
import { useNavigate } from 'react-router';
import LocationInfoPopup from '../components/LocationInfoPopup';
import Hint from '../components/Hint';
import Loading from '../components/Loading';
import useRequestStore from '../stores/request/requestStore';
import ImageUpload from 'components/ImageUpload';

function Home() {
  const settings = window.settings;
  const { experienceVisualSearch, experienceVisualSearchImages, geoLocation } =
    settings;
  const navigate = useNavigate();

  const [experienceVisualSearchBlobs, setExperienceVisualSearchBlobs] =
    useState<Blob[]>([]);
  const [isOpenModalCamera, setOpenModalCamera] = useState<boolean>(false);
  const showLoading = useRequestStore(store => store.showLoading);

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
      {showLoading && (
        <div className="box-wrap-loading" style={{ zIndex: 99999999 }}>
          <Loading />
        </div>
      )}
      <div
        className={twMerge([
          'relative',
          'hidden desktop:flex',
          'flex-col',
          'items-center',
          'justify-center',
          'h-auto',
          !window.settings.experienceVisualSearch ? 'mt-[calc(50vh-110px)]' : 'mt-[calc(50vh-156px)]',
        ])}
      >
        {geoLocation && <LocationInfoPopup />}
        <div className="relative flex items-center justify-center w-full gap-2">
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

          <TextSearch className="h-[56px]" showImageUpload={false} />
          <div
            className={twMerge(
              'h-14 w-14 flex items-center justify-center rounded-full bg-[#FFFFFF] hover:bg-[#F3F4F8] border border-solid border-[#DDDEE7]',
              'shadow-ds-2',
            )}
          >
            <ImageUpload />
          </div>
        </div>
        <div className="max-w-[532px] relative w-full">
          <DragDropFile />
          {settings.experienceVisualSearch && (
            <ExperienceVisualSearchTrigger
              experienceVisualSearchBlobs={experienceVisualSearchBlobs}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col desktop:hidden justify-center items-center w-full h-full overflow-y-auto">
        <MobileCameraCTA setOpenModalCamera={setOpenModalCamera} />
        <div className="box-screenshot-camera">
          <CustomCamera
            show={isOpenModalCamera}
            onClose={() => {
              setOpenModalCamera(s => !s);
            }}
          />
        </div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 24,
            margin: 16,
          }}
        >
          Snap & Search
        </div>
        <Hint />
        {settings.experienceVisualSearch && (
          <ExperienceVisualSearchTrigger
            experienceVisualSearchBlobs={experienceVisualSearchBlobs}
          />
        )}

        <div className="flex desktop:hidden w-full fixed bottom-12 px-2 gap-2">
          <TextSearch className="flex md:hidden w-full " />
        </div>
      </div>
    </>
  );
}

export default Home;
