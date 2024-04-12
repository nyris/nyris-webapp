import React, { useState, memo } from 'react';
import { createPortal } from 'react-dom';
import './ExperienceVisualSearch.scss';
import { ReactComponent as ExperienceIcon } from '../../common/experience-visual-icon.svg';

function ExperienceVisualSearch() {
  const [showModal, setShowModal] = useState(false);

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
        className="experience-visual-button"
        onClick={() => modalToggle(true)}
      >
        <span />
        <ExperienceIcon />
      </div>
      {showModal &&
        createPortal(
          <div
            className="custom-modal"
            onClick={(e) => {
              e.stopPropagation();
              modalToggle(false);
            }}
          >
            <div
              className="custom-modal-body"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div
                className="close-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  modalToggle(false);
                }}
              >
                x
              </div>
              <div className="custom-modal-body-title">Experience Visual Search</div>
              <div className="custom-modal-body-subtitle">Choose from the array of images below to commence a visual search and explore further:</div>
              <div className="custom-modal-body-content">
                the modal body
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

export default memo(ExperienceVisualSearch);