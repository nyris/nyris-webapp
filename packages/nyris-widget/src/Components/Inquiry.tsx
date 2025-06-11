import React, { useState } from 'react';
import Modal from './Modal';
import '../styles/inquiry-modal.scss';

interface IInquiry {
  imageSource: any;
  isPopupOpened: boolean;
  labels: any;
  onClose: () => void;
}

const Inquiry = ({ imageSource, isPopupOpened, labels, onClose }: IInquiry) => {
  const [email, setEmail] = useState<string>('')
  return (
    <Modal
      isOpen={isPopupOpened}
      onClose={() => onClose()}
      className="inquiry-modal"
    >
      <div
        className="inquiry-modal-header"
      >
        {labels['Submit your image for inquiry']}
      </div>
      <img
        src={imageSource.toDataURL('image/png')}
        alt="searched image"
        className="inquiry-modal-image"
      />
      <div className="inquiry-modal-input">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="inquiry-modal-input">
        Additional information
        <textarea />
      </div>
      <div className="inquiry-modal-buttons">
        <button
          className="inquiry-modal-buttons-cancel"
          onClick={() => onClose()}
        >
          {labels['Cancel']}
        </button>
        <button
          className="inquiry-modal-buttons-apply"
        >
          {labels['Apply']}
        </button>
      </div>
    </Modal>
  )
};

export default Inquiry;