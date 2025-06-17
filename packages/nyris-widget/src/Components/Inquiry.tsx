import React, {useEffect, useState} from 'react';
import emailjs from '@emailjs/browser';
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

// eslint-disable-next-line
const emailRegex = /.+\@.+\..+$/;

const Inquiry = ({ imageSource, isPopupOpened, labels, onClose, prefilters }: IInquiry) => {
  const [email, setEmail] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [emailValid, setEmailValid] = useState<boolean>(false);

  useEffect(() => {
    if (email)
       setEmailValid(emailRegex.test(email));
  }, [email]);

  useEffect(() => emailjs.init('SMGihPnuEGcYLm0V4'), []);

  const onSend = async () => {
    await emailjs
      .send('service_zfsxshi', 'template_rxsi7w9', {
        email_id: email.trim(),
        information_text: additionalInfo ? additionalInfo : '<not specified>',
        request_image: imageSource?.toDataURL(),
        prefilter_values: prefilters?.length
          ? prefilters.join(', ')
          : '<not specified>',
      })
      .finally(() => onClose());
  };

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
      <div className="inquiry-modal-info">
        <img
          src={imageSource.toDataURL('image/png')}
          alt="searched image"
          className="inquiry-modal-image"
        />
        <div className="inquiry-modal-input">
          {labels['Search criteria']}
          <div className="inquiry-modal-input-prefilters-container">
            {prefilters.map(prefilter => (
              <div
                className="inquiry-modal-input-prefilters"
                style={{
                  color: window.nyrisSettings.primaryColor || '#3E36DC',
                  backgroundColor: window.nyrisSettings.browseGalleryButtonColor || '#E4E3FF'
                }}
              >
                {prefilter}
              </div>
            ))}
          </div>
          {!prefilters.length && (
            <span className="no-prefilters">
              {labels['Search criteria is not selected']}
            </span>
          )}
        </div>
        <div className="inquiry-modal-input">
          {labels['Your email']}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="inquiry-modal-input">
          {labels['Additional information']}
          <span>{additionalInfo.length}/150</span>
          <textarea
            maxLength={150}
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
          />
        </div>
      </div>
      <div className="inquiry-modal-buttons">
        <button
          className="inquiry-modal-buttons-cancel"
          onClick={() => onClose()}
        >
          {labels['Cancel']}
        </button>
        <button
          className={`inquiry-modal-buttons-apply ${emailValid ? 'active' : ''}`}
          onClick={() => onSend()}
        >
          {labels['Send']}
        </button>
      </div>
    </Modal>
  )
};

export default Inquiry;