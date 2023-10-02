import { Box } from '@material-ui/core';
import { getCroppedCanvas } from 'helpers/getCroppedCanvas';
import React, { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import InquiryModal from './InquiryModal';

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

  return (
    <>
      {isInquiryModalOpen && (
        <InquiryModal
          requestImage={requestImage}
          selectedRegion={selectedRegion}
          setIsInquiryModalOpen={setIsInquiryModalOpen}
          isInquiryModalOpen={isInquiryModalOpen}
          setInquiryStatus={setInquiryStatus}
        />
      )}
      <Box
        style={{
          padding: !isMobile ? '24px 40px 24px 40px' : '16px 16px 16px 16px',
          backgroundColor: '#F3F3F5',
          width: '100%',
          marginBottom: '32px',
          alignSelf: 'end',
          display: 'flex',
          alignItems: 'center',
        }}
        className="rfq-box"
      >
        <Box
          style={{
            width: '100%',
            display: 'flex',
            columnGap: !isMobile ? '26px' : '8px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {requestImage && (
            <div>
              <img
                src={getCroppedCanvas(
                  requestImage?.canvas,
                  selectedRegion,
                )?.toDataURL()}
                alt="request_image"
                style={{
                  mixBlendMode:
                    inquiryStatus !== 'inactive' ? 'overlay' : 'unset',
                  maxHeight: !isMobile ? '181px' : '120px',
                  maxWidth: !isMobile ? '181px' : '120px',
                  borderRadius: '2px',
                }}
              />
            </div>
          )}

          <Box>
            <Box
              style={{
                paddingBottom: '12px',
                paddingLeft: '16px',
              }}
            >
              <Box
                style={{
                  fontSize: '14px',
                  color: inquiryStatus === 'inactive' ? '#4B4B4A' : '#2B2C46',
                  fontWeight: 'bold',
                }}
              >
                {isMobile
                  ? 'No matches found?'
                  : 'No matches found for your request?'}
              </Box>
              <Box
                style={{
                  fontSize: '12px',
                  maxWidth: '320x',
                  lineHeight: '14.1px',
                  color: inquiryStatus === 'inactive' ? '#4B4B4A' : '#2B2C46',
                  fontWeight: 'normal',
                }}
              >
                Get personalised help from our team of product experts.
              </Box>
            </Box>
            <button
              style={{
                width: '200px',
                background:
                  inquiryStatus === 'inactive' ? '#2B2C46' : '#E9E9EC',
                boxShadow:
                  inquiryStatus === 'inactive'
                    ? '0px 0px 4px 0px rgba(0, 0, 0, 0.25)'
                    : '',
                borderRadius: '2px',
                padding: '16px 16px 16px 16px',
                display: 'flex',
                alignItems: 'center',
                color: inquiryStatus === 'inactive' ? '#fff' : '#CACAD1',
                fontSize: '14px',
                height: '48px',
                cursor: inquiryStatus === 'inactive' ? 'pointer' : 'default',
                border: 'none',
              }}
              disabled={inquiryStatus !== 'inactive'}
              onClick={() => {
                setIsInquiryModalOpen(true);
              }}
            >
              Inquiry
            </button>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default InquiryBanner;
