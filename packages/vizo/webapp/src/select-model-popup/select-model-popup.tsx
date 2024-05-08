import React, {useState} from 'react';
import { ReactComponent as VizoIcon } from '../assets/Vizo.svg';
import { createPortal } from 'react-dom';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';

function SelectModelPopup() {
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
    <div>
      <button className="ask-vizo" onClick={() => modalToggle(true)}>
        <VizoIcon />
        All
      </button>
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
              <CloseOutlinedIcon
                style={{ fontSize: 24, color: '#55566B' }}
                className="close-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  modalToggle(false);
                }}
              />
              <div className="custom-modal-body-title">Select a model</div>
              <div className="custom-modal-body-content">
                here is models
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default SelectModelPopup;