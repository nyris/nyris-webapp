import { useState, memo, useEffect } from 'react';

import '../../styles/experienceVisualSearch.scss';

import { Icon } from '@nyris/nyris-react-components';
import ExperienceVisualSearchModal from './ExperienceVisualSearchModal';
import { useTranslation } from 'react-i18next';

function ExperienceVisualSearchTrigger({
  experienceVisualSearchBlobs,
}: {
  experienceVisualSearchBlobs: Blob[];
}) {
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();

  const [expand, setExpand] = useState(false);

  useEffect(() => {
    let intervalId: any;
    if (document.body.getBoundingClientRect().width >= 776) {
      if (!showModal) {
        intervalId = setInterval(() => {
          setExpand(s => !s);
        }, 3000);
      } else {
        clearInterval(intervalId);
        setExpand(false);
      }
      return () => {
        clearInterval(intervalId);
      };
    } else {
      setExpand(true);
    }
  }, [showModal]);

  const modalToggle = (isOpen: boolean) => {
    setShowModal(isOpen);
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  };

  return (
    <>
      <div className="flex flex-col items-center">
        <div
          className={`group bg-[#3E36DC] w-[215px] desktop:w-10 hover:w-[215px] hover:gap-2 ${
            expand ? 'desktop:w-[215px] gap-2' : ''
          } h-10 flex flex-row justify-center items-center rounded-full cursor-pointer my-8 transition-all duration-300`}
          onClick={() => modalToggle(true)}
        >
          <span
            className={`${
              expand ? 'flex-grow max-w-fit' : 'flex-grow-0 w-0'
            } group-hover:flex-grow group-hover:max-w-fit overflow-hidden whitespace-nowrap text-sm font-semibold leading-4 text-center text-white break-keep transition-all duration-300`}
          >
            {t('Experience Visual Search')}
          </span>
          <div className="flex flex-grow-0">
            <Icon name="experience_visual_search" />
          </div>
        </div>
      </div>

      <ExperienceVisualSearchModal
        experienceVisualSearchBlobs={experienceVisualSearchBlobs}
        handleClose={modalToggle}
        openModal={showModal}
      />
    </>
  );
}

export default memo(ExperienceVisualSearchTrigger);
