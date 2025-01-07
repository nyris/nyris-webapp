import React from 'react';

import { useState, memo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { createPortal } from 'react-dom';

import { useImageSearch } from 'hooks/useImageSearch';

import '../../styles/experienceVisualSearch.scss';

import { Icon } from '@nyris/nyris-react-components';
import ExperienceVisualSearchModal from './ExperienceVisualSearchModal';

function ExperienceVisualSearchTrigger({
  experienceVisualSearchBlobs,
}: {
  experienceVisualSearchBlobs: Blob[];
}) {
  const [showModal, setShowModal] = useState(false);
  const button = useRef(null);
  let interval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (document.body.getBoundingClientRect().width >= 776) {
      if (!showModal) {
        interval.current = setInterval(() => {
          if (button?.current) {
            (button.current as HTMLElement).classList.toggle('hover');
          }
        }, 3000);
      } else if (interval?.current) {
        clearInterval(interval?.current);
        if (
          button?.current &&
          !(button.current as HTMLElement).classList.contains('hover')
        ) {
          (button.current as HTMLElement).classList.toggle('hover');
        }
      }
      return () => {
        if (interval?.current) {
          clearInterval(interval?.current);
        }
      };
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
      <div
        ref={button}
        className="experience-visual-button"
        onClick={() => modalToggle(true)}
      >
        <span />
        <Icon name="experience_visual_search" />
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
