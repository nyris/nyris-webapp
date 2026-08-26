import { Icon } from '@nyris/nyris-react-components';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import Tooltip from './Tooltip/TooltipComponent';
import { useAuth0 } from '@auth0/auth0-react';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import useRequestStore from 'stores/request/requestStore';
import UploadDisclaimer from './UploadDisclaimer';
import { useUploadSearch } from 'hooks/useUploadSearch';

function ImageUpload({
  onCameraClick,
  disableDisclaimer,
}: {
  onCameraClick?: () => void;
  disableDisclaimer?: boolean;
}) {
  const settings = window.settings;
  const user = useAuth0().user;

  const { t } = useTranslation();

  const location = useLocation();
  const { uploadFile } = useUploadSearch();

  const requestImages = useRequestStore(state => state.requestImages);
  const setMetaFilter = useRequestStore(state => state.setMetaFilter);

  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const showPreFilter = useMemo(() => {
    if (settings.shouldUseUserMetadata && user) {
      if (user['/user_metadata']?.value) {
        setMetaFilter(user['/user_metadata'].value);
      }
    }

    if (settings.shouldUseUserMetadata && user) {
      if (settings.preFilterOption && !user['/user_metadata']?.value) {
        return true;
      }
      return false;
    }

    return settings.preFilterOption;
  }, [
    setMetaFilter,
    settings.preFilterOption,
    settings.shouldUseUserMetadata,
    user,
  ]);

  const showDisclaimerDisabled = useMemo(() => {
    if (disableDisclaimer) return true;
    const disclaimer = localStorage.getItem('upload-disclaimer-suite');
    if (requestImages.length === 0) return true;
    if (!disclaimer) return false;
    return disclaimer === 'dont-show';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDisclaimer, requestImages, disableDisclaimer]);

  const handleUpload = (files: File[]) => {
    const file = files[0];
    if (!file) {
      return;
    }

    uploadFile(file, { showPreFilter });
  };

  return (
    <>
      <div
        className={twMerge([
          location.pathname !== '/result' && 'hidden desktop:flex',
        ])}
      >
        <input
          accept={'.stp,.step,.stl,.obj,.glb,.gltf,.heic,.heif,.pdf,image/*'}
          id="icon-button-file"
          type="file"
          style={{ display: 'none' }}
          onClick={e => {
            e.stopPropagation();
          }}
          onChange={e => {
            if (e?.target?.files) {
              handleUpload(Array.from(e.target.files));
            }
            e.target.value = '';
          }}
        />
        <Tooltip content={t('Search with an image')}>
          <label
            className={twMerge(
              'min-w-10 min-h-10 flex justify-center items-center cursor-pointer rounded-full bg-gray-100 desktop:bg-transparent hover:bg-gray-100',
              location.pathname === '/result' && 'desktop:w-8 desktop:h-8',
              location.pathname !== '/result' &&
                'desktop:bg-[#FAFAFA] desktop:hover:bg-[#FAFAFA]',
            )}
            htmlFor={
              showDisclaimerDisabled && !onCameraClick ? 'icon-button-file' : ''
            }
            onClick={() => {
              if (!showDisclaimerDisabled) {
                // disclaimer
                setShowDisclaimer(true);
              } else if (onCameraClick) {
                onCameraClick();
              }
            }}
          >
            <Icon name="camera_ai" width={16} height={16} fill="#3B3E5F" />
          </label>
        </Tooltip>
      </div>

      {showDisclaimer && !disableDisclaimer && (
        <UploadDisclaimer
          onClose={() => {
            setShowDisclaimer(false);
          }}
          onContinue={({
            file,
            dontShowAgain,
          }: {
            file: any;
            dontShowAgain: any;
          }) => {
            if (dontShowAgain) {
              localStorage.setItem('upload-disclaimer-suite', 'dont-show');
            }

            if (onCameraClick) {
              onCameraClick();
            } else {
              if (file) {
                handleUpload(Array(file));
              }
            }

            setShowDisclaimer(false);
          }}
        />
      )}
    </>
  );
}

export default ImageUpload;
