import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ReactComponent as Box3dIcon } from './images/3d.svg';
import { ReactComponent as IconClose } from './images/close.svg';
import { ResultProps } from './Result';
import CadenasWebViewer from './CadenasWebViewer';

const Popup3D = ({ resultDetails }: {resultDetails: ResultProps }) => {
  const [showModal, setShowModal] = useState(false);
  const mountPoint = document.querySelector('.nyris__wrapper');
  const [status3dView, setStatus3dView] = useState<
    'loading' | 'loaded' | 'not-found' | undefined
  >();

  const modalToggle = (isOpen: boolean) => {
    setShowModal(isOpen);
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  };

  return (
    <div className="popup-3d">
      <div
        className="poput-button-3d"
        onClick={() => modalToggle(true)}
      >
        <Box3dIcon width={16} height={16} color={'#AAABB5'} />
      </div>
      {mountPoint &&
        showModal &&
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
             <IconClose
               width={16}
               height={16}
               className="close-icon"
               onClick={(e) => {
                 e.stopPropagation();
                 modalToggle(false);
               }}
             />
             <CadenasWebViewer
               is3dView={true}
               sku={resultDetails.sku}
               status3dView={status3dView}
               setStatus3dView={setStatus3dView}
             />
             <div>{resultDetails.title}</div>
             <div>{resultDetails.sku}</div>
             
           </div> 
          </div>,
          mountPoint
        )
      }
    </div>
  )
}

export default Popup3D;