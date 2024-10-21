import { getCroppedCanvas } from 'helpers/getCroppedCanvas';
import React, { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import InquiryModal from './InquiryModal';
import { useAppSelector } from 'Store/Store';
import { useTranslation } from 'react-i18next';
import { Icon } from '@nyris/nyris-react-components';

function InquiryBanner({
  requestImage,
  selectedRegion,
  query,
}: {
  requestImage: any;
  selectedRegion: any;
  query: any;
}) {
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryStatus, setInquiryStatus] = useState<
    'inactive' | 'loading' | 'sent'
  >('inactive');

  useEffect(() => {
    setInquiryStatus('inactive');
  }, [selectedRegion, query]);

  const { description, emailInquiry, supportNumber } =
    useAppSelector(state => state.settings.support) || {};
  const { secondaryColor } =
    useAppSelector(state => state.settings.theme) || {};

  const { t } = useTranslation();

  return (
    <>
      {isInquiryModalOpen && (
        <InquiryModal
          requestImage={requestImage}
          selectedRegion={selectedRegion}
          setIsInquiryModalOpen={setIsInquiryModalOpen}
          isInquiryModalOpen={isInquiryModalOpen}
        />
      )}
      <div
        style={{
          backgroundColor: '#F3F3F5',
          width: '100%',
          marginBottom: '24px',
          alignSelf: 'end',
          display: 'flex',
          alignItems: 'center',
          // marginRight: '12px',
        }}
        className="rfq-box"
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            columnGap: !isMobile ? '26px' : '16px',
            alignItems: 'center',
          }}
        >
          {requestImage && (
            <div>
              <img
                src={getCroppedCanvas(
                  requestImage,
                  selectedRegion,
                )?.toDataURL()}
                alt="request_image"
                style={{
                  mixBlendMode: 'unset',
                  maxHeight: !isMobile ? '181px' : '120px',
                  maxWidth: !isMobile ? '181px' : '120px',
                  borderRadius: '2px',
                }}
              />
            </div>
          )}

          <div style={{ width: '100%' }}>
            <div
              style={{
                paddingBottom: '8px',
                paddingLeft: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  color: inquiryStatus === 'inactive' ? '#4B4B4A' : '#2B2C46',
                  fontWeight: 'bold',
                }}
              >
                {isMobile
                  ? `${t('No matches found')}?`
                  : `${t('No matches found for your request')}?`}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  maxWidth: '320x',
                  lineHeight: '16px',
                  color: inquiryStatus === 'inactive' ? '#4B4B4A' : '#2B2C46',
                  fontWeight: 'normal',
                }}
              >
                {description}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                gap: isMobile ? '8px' : '16px',
                width: '100%',
                maxWidth: '400px',
              }}
              className="support-button-wrapper"
            >
              {emailInquiry && (
                <div
                  style={{
                    width: emailInquiry && supportNumber ? '50%' : '100%',
                    maxWidth: '170px',
                    minWidth: '86px',
                    background:
                      inquiryStatus === 'inactive' ? secondaryColor : '#E9E9EC',
                    boxShadow:
                      inquiryStatus === 'inactive'
                        ? '0px 0px 4px 0px rgba(0, 0, 0, 0.25)'
                        : '',
                    borderRadius: '2px',
                    padding: !isMobile
                      ? '8px 16px 8px 16px'
                      : '8px 8px 8px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    color: inquiryStatus === 'inactive' ? '#fff' : '#CACAD1',
                    fontSize: '13px',
                    cursor:
                      inquiryStatus === 'inactive' ? 'pointer' : 'default',
                    border: 'none',
                  }}
                  onClick={() => {
                    setIsInquiryModalOpen(true);
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <p>Inquiry</p>
                    <Icon name="email" color="#fff" width={16} height={12} />
                  </div>
                </div>
              )}
              {supportNumber && (
                <a
                  style={{
                    width: emailInquiry && supportNumber ? '50%' : '100%',
                    maxWidth: '170px',
                    minWidth: '86px',
                    background: secondaryColor,
                    boxShadow: '0px 0px 4px 0px rgba(0, 0, 0, 0.25)',
                    borderRadius: '2px',
                    padding: !isMobile
                      ? '8px 16px 8px 16px'
                      : '8px 8px 8px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#fff',
                    fontSize: '13px',
                    cursor: 'pointer',
                    border: 'none',
                    fontWeight: 500,
                  }}
                  href={`tel:${supportNumber}`}
                >
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <p> Call us</p>
                    <Icon name="call" color="#fff" width={16} height={16} />
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default InquiryBanner;
