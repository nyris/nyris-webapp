import React, { useState } from 'react';
import { createPortal } from 'react-dom';

import { Icon, makeFileHandler } from '@nyris/nyris-react-components';
import { useMediaQuery } from 'react-responsive';

function UploadDisclaimer({
  onClose,
  onContinue,
}: {
  onClose: any;
  onContinue: any;
}) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const isCadSearch = window.settings.cadSearch;
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });

  return (
    <>
      {createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black/50 w-screen h-screen z-[9999]">
          <div className="bg-white w-80">
            <div className="p-4">
              <div className="flex justify-between items-center">
                <div className="font-bold text-xl">Replace Current Data?</div>
                <Icon
                  name="close"
                  className="cursor-pointer"
                  width={12}
                  height={12}
                  onClick={onClose}
                />
              </div>
              <p className="text-sm mt-4">
                Uploading a new image will overwrite your current search
                parameters, text, and results. Are you sure you want to proceed?
              </p>
              <div className="mt-4 gap-x-2 flex">
                <input
                  type="checkbox"
                  className="w-4"
                  onChange={e => {
                    setDontShowAgain(e.target.checked);
                  }}
                />
                Don't show this again
              </div>
            </div>
            <div className="flex">
              <button
                className="w-1/2 h-16 p-4 text-start text-sm text-white bg-[#2B2C46]"
                onClick={() => onClose()}
              >
                Cancel
              </button>
              <label
                className="w-1/2 h-16 p-4 text-start text-sm text-white bg-[#E31B5D] cursor-pointer"
                htmlFor={!isMobile ? 'nyris__upload-photo' : ''}
                onClick={() => {
                  if (isMobile) {
                    onContinue({ dontShowAgain });
                  }
                }}
              >
                Continue
              </label>
              <input
                type="file"
                name="take-picture"
                id="nyris__upload-photo"
                accept={`${
                  isCadSearch ? '.stp,.step,.stl,.obj,.glb,.gltf,' : ''
                }image/jpeg,image/png,image/webp`}
                onChange={makeFileHandler(file =>
                  onContinue({ file, dontShowAgain }),
                )}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

export default UploadDisclaimer;
