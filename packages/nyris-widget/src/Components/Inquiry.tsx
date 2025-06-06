import React, { useState } from 'react';
import Modal from './Modal';

interface IInquiry {
  imageSource: any;
}

const Inquiry = ({ imageSource }: IInquiry) => {
  const [isPopupOpened, setIsPopupOpened] = useState(false);
  return (
    <div className="nyris__inquiry-container">
      <img
        src={imageSource.toDataURL('image/png')}
        alt="searched image"
        className="nyris__inquiry-container-image"
      />
      <div className="inyris__nquiry-container-banner">
        <button
          onClick={() => setIsPopupOpened(true)}
        >
          Inquiry
        </button>
        <Modal
          isOpen={isPopupOpened}
          onClose={() => console.log('closed')}
          className="web-camera"
        >
          <div>this is the modal</div>
        </Modal>
      </div>
    </div>
  )
};

export default Inquiry;