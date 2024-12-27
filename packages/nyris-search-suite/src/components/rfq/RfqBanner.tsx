import { getCroppedCanvas } from 'utils/misc';
import RfqModal from './RfqModal';
import { useState } from 'react';

function RfqBanner({
  requestImage,
  selectedRegion,
}: {
  requestImage: any;
  selectedRegion: any;
}) {
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [rfqStatus, setRfqStatus] = useState<'inactive' | 'loading' | 'sent'>(
    'inactive',
  );
  return (
    <>
      {isRfqModalOpen && (
        <RfqModal
          setIsRfqModalOpen={setIsRfqModalOpen}
          isRfqModalOpen={isRfqModalOpen}
          setRfqStatus={setRfqStatus}
        />
      )}
      <div
        style={{
          padding: '0px 16px 0px 16px',
          backgroundColor: '#F6F3F1',
          width: '100%',
          alignSelf: 'end',
          height: '248px',
          display: 'flex',
          alignItems: 'center',
        }}
        className="rfq-box desktop:mb-8"
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            columnGap: '16px',
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          <div>
            <img
              src={getCroppedCanvas(requestImage, selectedRegion)?.toDataURL()}
              alt="request_image"
              style={{
                mixBlendMode: rfqStatus !== 'inactive' ? 'overlay' : 'unset',
                maxHeight: '181px',
                maxWidth: '181px',
                borderRadius: '2px',
              }}
            />
          </div>
          <div>
            <div
              style={{
                paddingBottom: '12px',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  color: rfqStatus === 'inactive' ? '#4B4B4A' : '#CACAD1',
                  fontWeight: 'bold',
                }}
              >
                <p className="desktop:hidden">No matches found?</p>
                <p className="hidden desktop:block">
                  No matches found for your request?
                </p>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  maxWidth: '320x',
                  lineHeight: '14.1px',
                  color: rfqStatus === 'inactive' ? '#4B4B4A' : '#CACAD1',
                  fontWeight: 'normal',
                }}
              >
                Get personalised help from our team of product experts.
              </div>
            </div>
            <button
              style={{
                maxWidth: '200px',
                background: rfqStatus === 'inactive' ? '#4B4B4A' : '#E9E9EC',
                boxShadow:
                  rfqStatus === 'inactive'
                    ? '0px 0px 4px 0px rgba(0, 0, 0, 0.25)'
                    : '',
                borderRadius: '2px',
                padding: '16px 16px 16px 16px',
                display: 'flex',
                alignItems: 'center',
                color: rfqStatus === 'inactive' ? '#fff' : '#CACAD1',
                fontSize: '14px',
                height: '48px',
                cursor: rfqStatus === 'inactive' ? 'pointer' : 'default',
                border: 'none',
              }}
              disabled={rfqStatus !== 'inactive'}
              onClick={() => {
                setIsRfqModalOpen(true);
              }}
            >
              Request a Quote
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default RfqBanner;
