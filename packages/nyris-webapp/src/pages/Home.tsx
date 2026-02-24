import React, { useEffect, useMemo, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
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
import { getFilters } from '../services/filter';

function Home() {
  const settings = window.settings;
  const user = useAuth0().user;
  const { experienceVisualSearch, experienceVisualSearchImages, geoLocation } =
    settings;
  const navigate = useNavigate();

  const [experienceVisualSearchBlobs, setExperienceVisualSearchBlobs] =
    useState<Blob[]>([]);
  const [isOpenModalCamera, setOpenModalCamera] = useState<boolean>(false);
  const showLoading = useRequestStore(store => store.showLoading);
  const setPreFilterList = useRequestStore(state => state.setPreFilterList);
  const setPreFilterLoading = useRequestStore(
    state => state.setPreFilterLoading,
  );
  const setMetaFilter = useRequestStore(state => state.setMetaFilter);

  const showPreFilter = useMemo(() => {
    if (settings.shouldUseUserMetadata && user) {
      if (user['/user_metadata'].value) {
        setMetaFilter(user['/user_metadata'].value);
      }
    }

    if (settings.shouldUseUserMetadata && user) {
      if (settings.preFilterOption && !user['/user_metadata'].value) {
        return true;
      }
      return false;
    }

    return settings.preFilterOption;
  }, [
    setMetaFilter,
    settings.preFilterOption,
    settings.shouldUseUserMetadata,
    user,
  ]);

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

  const getPreFilters = async () => {
    setPreFilterLoading(true);
    try {
      const res = await getFilters(1000, settings);
      setPreFilterList(res);
    } catch (e: any) {
      console.log('err getDataFilterDesktop', e);
    } finally {
      setPreFilterLoading(false);
    }
  };

  useEffect(() => {
    if (showPreFilter) {
      getPreFilters();
    }
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
          'mt-[calc(50vh-75px)]',
          'bg-[#fafafa]',
        ])}
      >
        {geoLocation && <LocationInfoPopup />}
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
        <div className="max-w-[532px] relative w-full">
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

        <div className="flex desktop:hidden w-full">
          <TextSearch className="flex md:hidden fixed bottom-12 w-full px-2 gap-2" />
        </div>
      </div>
    </>
  );
}

export default Home;
