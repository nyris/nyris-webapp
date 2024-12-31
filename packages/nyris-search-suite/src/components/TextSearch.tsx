import React, { useCallback, useMemo, useRef, useState } from 'react';

import { isEmpty, debounce } from 'lodash';
import { twMerge } from 'tailwind-merge';
import { useAuth0 } from '@auth0/auth0-react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { Icon } from '@nyris/nyris-react-components';

import { useImageSearch } from 'hooks/useImageSearch';
import PreFilterModal from './PreFilter/PreFilterModal';
import useRequestStore from 'stores/request/requestStore';

function TextSearch({ className }: { className?: string }) {
  const settings = window.settings;
  const user = useAuth0().user;

  const focusInp: any = useRef<HTMLDivElement | null>(null);

  const { t } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();

  const preFilter = useRequestStore(state => state.preFilter);
  const requestImages = useRequestStore(state => state.requestImages);
  const setQuery = useRequestStore(state => state.setQuery);
  const query = useRequestStore(state => state.query);
  const valueInput = useRequestStore(state => state.valueInput);
  const setValueInput = useRequestStore(state => state.setValueInput);
  const setMetaFilter = useRequestStore(state => state.setMetaFilter);

  const [isOpenModalFilterDesktop, setToggleModalFilterDesktop] =
    useState<boolean>(false);
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
    const disclaimer = localStorage.getItem('upload-disclaimer-webapp');
    if (requestImages.length === 0) return true;
    if (!disclaimer) return false;
    return disclaimer === 'dont-show';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDisclaimer, requestImages]);

  const visualSearch = useMemo(() => requestImages.length > 0, [requestImages]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchOrRedirect = useCallback(
    debounce((value: any) => {
      setQuery(value);
      navigate('/result');
    }, 350),
    [requestImages, preFilter],
  );

  const onChangeText = (event: any) => {
    setValueInput(event.currentTarget.value);
    searchOrRedirect(event.currentTarget.value);

    if (event.currentTarget.value === '') {
      setValueInput('');
      setQuery('');
    }
  };

  const { singleImageSearch } = useImageSearch();

  const handleUpload = (files: File[]) => {
    setValueInput('');
    setQuery('');

    navigate('/result');

    singleImageSearch({
      image: files[0],
      settings: window.settings,
      showFeedback: true,
    }).then(() => {});
  };

  return (
    <div className={twMerge('w-[426px] h-10', className)}>
      <div
        className={twMerge([
          'bg-white',
          'desktop:bg-gray-200',
          'desktop:border border-solid',
          'desktop:border-gray-300',
          'desktop:focus-within:bg-white',
          'desktop:focus-within:shadow-[0px_0px_6px_rgba(202,202,209,1)]',
          'shadow-[0px_0px_16px_0px_rgba(170,171,181,0.50)]',
          'desktop:shadow-none',
          'flex',
          'h-10',
          'justify-between',
          'overflow-hidden',
          'p-0',
          'rounded-3xl',
          'w-full',
        ])}
      >
        <div className="flex justify-center items-center w-full">
          <div
            className={twMerge([
              'relative',
              'flex',
              'justify-center',
              'items-center',
              'w-full',
              'h-full',
            ])}
          >
            <div
              className={twMerge([
                'flex',
                'min-w-[40px]',
                'h-full',
                'justify-center',
                'items-center',
                'desktop:border-r',
                'border-solid',
                'border-[#CACAD1]',
              ])}
              style={{
                cursor: showPreFilter ? 'pointer' : 'default',
              }}
              onClick={() =>
                showPreFilter ? setToggleModalFilterDesktop(true) : false
              }
            >
              {showPreFilter && (
                <div
                  className={twMerge(
                    `p-[9px] flex rounded-full bg-[#f3f3f5]`,
                    !isEmpty(preFilter)
                      ? 'desktop:bg-theme-primary'
                      : 'desktop:bg-[#2B2C46]',
                  )}
                >
                  <Icon
                    name="filter_settings"
                    className={twMerge(
                      !isEmpty(preFilter)
                        ? 'fill-theme-primary'
                        : 'fill-[#2B2C46]',
                      `desktop:fill-white`,
                    )}
                  />
                </div>
              )}
              {!showPreFilter && <Icon name="search" width={16} height={16} />}
              {!isEmpty(preFilter) && showPreFilter && (
                <div
                  style={{
                    position: 'absolute',
                    top: '1px',
                    left: '26px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'white',
                    width: '12px',
                    height: '12px',
                    borderRadius: '100%',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      background: settings.theme?.primaryColor,
                      borderRadius: '100%',
                      strokeWidth: '2px',
                    }}
                  ></div>
                </div>
              )}
            </div>

            <input
              style={{
                border: '0px',
                width: '100%',
                fontSize: 14,
                color: '#2B2C46',
              }}
              className="peer desktop:bg-gray-200 focus:bg-white pl-1.5 outline-none"
              placeholder={t('Search')}
              value={valueInput || query}
              onChange={onChangeText}
              ref={focusInp}
            />
          </div>

          {location.pathname === '/result' && (valueInput || query) && (
            <button
              className={twMerge([
                'flex',
                'justify-center',
                'items-center',
                'rounded-full',
                'cursor-pointer',
                'min-h-9',
                'min-w-9',
                'z-10',
                'hover:bg-gray-100',
                'mr-1',
              ])}
              onClick={() => {
                if (visualSearch) {
                  navigate('/result');
                  setValueInput('');
                  setQuery('');
                  return;
                }
                setQuery('');
                setValueInput('');
                navigate('/');
              }}
            >
              <Icon name="close" className="w-3 h-3 text-primary" />
            </button>
          )}
          <div
            className={twMerge([
              location.pathname !== '/result' && 'hidden desktop:flex',
            ])}
          >
            <input
              accept={`${
                settings.cadSearch ? '.stp,.step,.stl,.obj,.glb,.gltf,' : ''
              }image/*`}
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
              }}
            />
            <label
              className="w-10 h-10 flex justify-center items-center cursor-pointer rounded-full hover:bg-gray-100"
              htmlFor={showDisclaimerDisabled ? 'icon-button-file' : ''}
              onClick={e => {
                if (!showDisclaimerDisabled) {
                  setShowDisclaimer(true);
                }
              }}
            >
              <span
                color="primary"
                aria-label="upload picture"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '100%',
                  padding: 7,
                }}
              >
                <Icon
                  name="camera_simple"
                  width={16}
                  height={16}
                  fill="#2B2C46"
                />
              </span>
            </label>
          </div>
        </div>
      </div>
      {showPreFilter && (
        <PreFilterModal
          openModal={isOpenModalFilterDesktop}
          handleClose={() => setToggleModalFilterDesktop(false)}
        />
      )}
    </div>
  );
}

export default TextSearch;
