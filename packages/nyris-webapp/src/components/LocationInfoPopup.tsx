import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

const LocationInfoPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const shown = sessionStorage.getItem('locationNoticeShown');
    if (shown) return;

    navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        if (result.state === 'prompt') {
          setShowPopup(true);
        } else if (result.state === 'granted') {
          navigator.geolocation.getCurrentPosition(console.log, console.error);
          sessionStorage.setItem('locationNoticeShown', 'true');
        } else {
          sessionStorage.setItem('locationNoticeShown', 'true');
        }
      });
  }, []);

  const closePopup = () => {
    navigator.geolocation.getCurrentPosition(console.log, console.error);
    sessionStorage.setItem('locationNoticeShown', 'true');
    setShowPopup(false);
  }
  
  return (
    <div>
      {showPopup && createPortal(
        <div
          className="custom-modal"
          onClick={closePopup}
        >
          <div
            className="custom-modal-body geolocation"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
          >
              <div className="geolocation-title">{t('Please allow location access.')}</div>
              <div>{window.settings.geoLocationMessage}</div>
            <button type="button" onClick={closePopup}>{t('I understand')}</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default LocationInfoPopup;
