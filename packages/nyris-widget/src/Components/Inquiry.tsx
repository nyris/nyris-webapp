import React, { useState } from 'react';
import Modal from './Modal';
import '../styles/inquiry-modal.scss';
import { Icon } from '@nyris/nyris-react-components';

interface IInquiry {
  imageSource: any;
  isPopupOpened: boolean;
  labels: any;
  onClose: () => void;
  prefilters: string[];
}

const Inquiry = ({ imageSource, isPopupOpened, labels, onClose, prefilters }: IInquiry) => {
  const [email, setEmail] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
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
      <Icon
        name="close"
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
        }}
        onClick={() => onClose()}
      />
      <img
        src={imageSource.toDataURL('image/png')}
        alt="searched image"
        className="inquiry-modal-image"
      />
      <div className="inquiry-modal-input">
        Pre-filter applied
        <div></div>
      </div>
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
        <span>{additionalInfo.length}/150</span>
        <textarea
          maxLength={150}
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
        />
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