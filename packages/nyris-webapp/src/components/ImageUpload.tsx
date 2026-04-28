import { Icon } from '@nyris/nyris-react-components';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import Tooltip from './Tooltip/TooltipComponent';
import { useAuth0 } from '@auth0/auth0-react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import useRequestStore from 'stores/request/requestStore';
import { useImageSearch } from 'hooks/useImageSearch';
import { clone } from 'lodash';
import { useCadSearch } from 'hooks/useCadSearch';
import { isCadFile } from '@nyris/nyris-api';
import UploadDisclaimer from './UploadDisclaimer';

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
  const navigate = useNavigate();

  const preFilterList = useRequestStore(state => state.preFilterList);
  const requestImages = useRequestStore(state => state.requestImages);
  const setQuery = useRequestStore(state => state.setQuery);
  const setValueInput = useRequestStore(state => state.setValueInput);
  const setMetaFilter = useRequestStore(state => state.setMetaFilter);
  const specifications = useRequestStore(state => state.specifications);

  const setRequestImages = useRequestStore(state => state.setRequestImages);
  const setSpecifications = useRequestStore(state => state.setSpecifications);
  const setShowLoading = useRequestStore(state => state.setShowLoading);
  const setNameplateNotificationText = useRequestStore(
    state => state.setNameplateNotificationText,
  );
  const setShowNotMatchedError = useRequestStore(
    state => state.setShowNotMatchedError,
  );
  const setAlgoliaFilter = useRequestStore(state => state.setAlgoliaFilter);
  const setPreFilter = useRequestStore(state => state.setPreFilter);
  const setNameplateImage = useRequestStore(state => state.setNameplateImage);

  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const showPreFilter = useMemo(() => {
    if (settings.shouldUseUserMetadata && user) {
      if (user['/user_metadata'].value) {
        setMetaFilter(user['/user_metadata'].value);
      }
    }

    if (settings.shouldUseUserMetadata && user) {
      if (settings.preFilterOption && !user['/user_metadata'].value) {
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

  const { singleImageSearch } = useImageSearch();
  const { cadSearch } = useCadSearch();

  const handleUpload = (files: File[]) => {
    setValueInput('');
    setQuery('');

    if (isCadFile(files[0])) {
      cadSearch({ file: files[0], settings, newSearch: true }).then(() => {});

      return;
    }

    setShowLoading(true);

    singleImageSearch({
      image: files[0],
      settings: window.settings,
      showFeedback: true,
      newSearch: true,
      clearPostFilter: true,
    }).then(singleImageResp => {
      const specificationPrefilter =
        singleImageResp.image_analysis?.specification?.prefilter_value || null;
      const hasPrefilter = preFilterList.filter((filter: any) =>
        filter.values.includes(specificationPrefilter),
      );
      if (specificationPrefilter) {
        setRequestImages([]);
        setShowNotMatchedError(false);
        if (hasPrefilter.length) {
          setSpecifications(
            clone(singleImageResp.image_analysis.specification),
          );
          setNameplateImage(files[0]);
          setPreFilter({
            [singleImageResp.image_analysis?.specification?.prefilter_value]:
              true,
          });
          setAlgoliaFilter(
            `${settings.alogoliaFilterField}:'${singleImageResp.image_analysis?.specification?.prefilter_value}'`,
          );

          setShowLoading(false);
          navigate('/result');

          setTimeout(() => {
            setNameplateNotificationText(
              t('We have successfully defined the search criteria', {
                prefilter_value: specificationPrefilter,
                preFilterTitle:
                  window.settings.preFilterTitle?.toLocaleLowerCase(),
              }),
            );
          }, 1000);
          setTimeout(() => {
            setNameplateNotificationText('');
          }, 10000);
        }
        if (!hasPrefilter.length && showPreFilter) {
          setSpecifications(
            clone({
              ...singleImageResp.image_analysis.specification,
              specificationPrefilter,
            }),
          );
          navigate('/result');
          setPreFilter({});
          setAlgoliaFilter('');
          setShowLoading(false);
          setShowNotMatchedError(true);
          setTimeout(() => {
            setNameplateNotificationText(
              t('Extracted details from the nameplate could not be matched', {
                preFilterTitle:
                  window.settings.preFilterTitle?.toLocaleLowerCase(),
              }),
            );
          }, 1000);
          setTimeout(() => {
            setNameplateNotificationText('');
          }, 15000);
        }
      } else {
        if (!specifications?.is_nameplate) {
          setSpecifications({ ...specifications, is_nameplate: false });
        }
        setShowLoading(false);
        navigate('/result');
      }
    });
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
