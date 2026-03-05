import { useCallback, useMemo, useRef, useState } from 'react';
import { isEmpty, debounce } from 'lodash';
import { twMerge } from 'tailwind-merge';
import { useAuth0 } from '@auth0/auth0-react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { Icon } from '@nyris/nyris-react-components';

import { useImageSearch } from 'hooks/useImageSearch';
import PreFilterModal from './PreFilter/PreFilterModal';
import useRequestStore from 'stores/request/requestStore';
import Tooltip from './Tooltip/TooltipComponent';
import { useMediaQuery } from 'react-responsive';

function TextSearch({
  className,
}: {
  className?: string;
  onCameraClick?: () => void;
}) {
  const settings = window.settings;
  const user = useAuth0().user;

  const focusInp: any = useRef<HTMLDivElement | null>(null);
  const iconRef = useRef<HTMLDivElement>(null);

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
  const specifications = useRequestStore(state => state.specifications);
  const nameplateNotificationText = useRequestStore(
    state => state.nameplateNotificationText,
  );
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });

  const regions = useRequestStore(state => state.regions);
  const setSpecifications = useRequestStore(state => state.setSpecifications);

  const [isOpenModalFilterDesktop, setToggleModalFilterDesktop] =
    useState<boolean>(false);

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

  const visualSearch = useMemo(() => requestImages.length > 0, [requestImages]);
  const { singleImageSearch } = useImageSearch();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchOrRedirect = useCallback(
    debounce((value: any) => {
      setQuery(value);
      if (requestImages.length === 0 && value === '' && !specifications) {
        navigate('/');
        return;
      }

      if (!window.settings?.algolia.enabled && requestImages.length === 0) {
        singleImageSearch({
          image: requestImages[0],
          imageRegion: regions[0],
          text: value,
          settings,
          showFeedback: false,
          newSearch: false,
        });
      }

      navigate('/result');
    }, 350),
    [requestImages, preFilter, regions],
  );

  const onChangeText = (event: any) => {
    setValueInput(event.currentTarget.value);
    searchOrRedirect(event.currentTarget.value);

    if (event.currentTarget.value === '' && !specifications) {
      setValueInput('');
      setQuery('');
    }
  };

  return (
    <div
      className={twMerge(
        'w-full desktop:max-w-[531px] min-w-0',
        'h-14',

        className,
      )}
    >
      <div
        className={twMerge([
          'bg-white',
          'border border-solid',
          'border-[#DDDEE7]',
          'desktop:focus-within:bg-white',
          'desktop:focus-within:shadow-[0px_0px_6px_rgba(202,202,209,1)]',
          'shadow-drop-shadow-1',
          'flex',
          'h-full',
          'justify-between',
          'p-0',
          'rounded-[32px]',
          'w-full',
        ])}
      >
        <div className="flex justify-center items-center w-full p-2">
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
                'h-full',
                'justify-center',
                'items-center',
              ])}
              style={{
                cursor: showPreFilter ? 'pointer' : 'default',
              }}
              onClick={() =>
                showPreFilter ? setToggleModalFilterDesktop(true) : false
              }
            >
              {showPreFilter && (
                <Tooltip
                  content={
                    !isEmpty(preFilter)
                      ? Object.keys(preFilter).join(', ')
                      : t('Add or change pre-filter')
                  }
                >
                  <div
                    ref={iconRef}
                    className={twMerge(
                      'flex',
                      'h-10',
                      'w-10',
                      'justify-center',
                      'items-center',
                      location.pathname === '/result' && 'desktop:p-2',
                      `flex rounded-full bg-[#f3f3f5]`,
                      !isEmpty(preFilter)
                        ? 'desktop:bg-theme-primary'
                        : 'desktop:bg-[#FAFAFA]',
                    )}
                  >
                    <Icon
                      name="filter_settings"
                      className={twMerge(
                        !isEmpty(preFilter)
                          ? 'fill-theme-primary'
                          : 'fill-[#2B2C46]',
                      )}
                    />
                  </div>
                </Tooltip>
              )}
              {nameplateNotificationText && (
                <div
                  style={{
                    position: 'fixed',
                    backgroundColor:
                      nameplateNotificationText !==
                      t(
                        'Extracted details from the nameplate could not be matched',
                        {
                          preFilterTitle:
                            window.settings.preFilterTitle?.toLocaleLowerCase(),
                        },
                      )
                        ? '#E4E3FF'
                        : '#FFDBB3',
                    border: '1px solid',
                    borderColor:
                      nameplateNotificationText !==
                      t(
                        'Extracted details from the nameplate could not be matched',
                        {
                          preFilterTitle:
                            window.settings.preFilterTitle?.toLocaleLowerCase(),
                        },
                      )
                        ? '#3E36DC'
                        : '#FF8800',
                    fontSize: 13,
                    borderRadius: 24,
                    color: '#545987',
                    padding: '8px 16px',
                    margin: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 8,
                    zIndex: 999999,
                    top: !isMobile ? 60 : 'unset',
                    bottom: isMobile ? 76 : 'unset',
                    maxWidth: 510,
                    width: !isMobile ? 'unset' : '90%',
                    left: !isMobile ? 'unset' : 0,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: !isMobile ? -7 : 'unset',
                      bottom: isMobile ? -7 : 'unset',
                      left: !isMobile ? '50%' : 30,
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '7px solid transparent',
                      borderRight: '7px solid transparent',
                      borderTop: isMobile
                        ? `7px solid ${
                            nameplateNotificationText !==
                            t(
                              'Extracted details from the nameplate could not be matched',
                              {
                                preFilterTitle:
                                  window.settings.preFilterTitle?.toLocaleLowerCase(),
                              },
                            )
                              ? '#3E36DC'
                              : '#FF8800'
                          }`
                        : 'unset',
                      borderBottom: !isMobile
                        ? `7px solid ${
                            nameplateNotificationText !==
                            t(
                              'Extracted details from the nameplate could not be matched',
                              {
                                preFilterTitle:
                                  window.settings.preFilterTitle?.toLocaleLowerCase(),
                              },
                            )
                              ? '#3E36DC'
                              : '#FF8800'
                          }`
                        : 'unset',
                    }}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      top: !isMobile ? -6 : 'unset',
                      bottom: isMobile ? -6 : 'unset',
                      left: !isMobile ? '50%' : 30,
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: isMobile
                        ? `6px solid ${
                            nameplateNotificationText !==
                            t(
                              'Extracted details from the nameplate could not be matched',
                              {
                                preFilterTitle:
                                  window.settings.preFilterTitle?.toLocaleLowerCase(),
                              },
                            )
                              ? '#E4E3FF'
                              : '#FFDBB3'
                          }`
                        : 'unset',
                      borderBottom: !isMobile
                        ? `6px solid ${
                            nameplateNotificationText !==
                            t(
                              'Extracted details from the nameplate could not be matched',
                              {
                                preFilterTitle:
                                  window.settings.preFilterTitle?.toLocaleLowerCase(),
                              },
                            )
                              ? '#E4E3FF'
                              : '#FFDBB3'
                          }`
                        : 'unset',
                    }}
                  />
                  {nameplateNotificationText}
                </div>
              )}
              {!showPreFilter && (
                <div className="p-2 hidden desktop:block">
                  <Icon name="search" width={16} height={16} />
                </div>
              )}
              {!isEmpty(preFilter) && showPreFilter && (
                <div
                  className={twMerge(
                    'top-2 left-8 desktop:left-8 desktop:top-[1px]',
                    location.pathname === '/result' && 'desktop:left-[26px] ',
                  )}
                  style={{
                    position: 'absolute',
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
              className="peer focus:bg-white pl-1.5 outline-none"
              placeholder={t('Search')}
              value={valueInput}
              onChange={onChangeText}
              ref={focusInp}
            />
          </div>

          {location.pathname === '/result' && (valueInput || query) && (
            <Tooltip content={t('Clear text search')}>
              <button
                className={twMerge([
                  'flex',
                  'justify-center',
                  'items-center',
                  'rounded-full',
                  'cursor-pointer',
                  'min-w-10 min-h-10',
                  'z-10',
                  'hover:bg-gray-100',
                  'mr-2',
                  location.pathname === '/result' &&
                    'desktop:min-w-8 desktop:min-h-8',
                ])}
                onClick={() => {
                  if (visualSearch) {
                    navigate('/result');
                    setValueInput('');
                    setQuery('');
                    if (
                      !window.settings?.algolia.enabled &&
                      requestImages.length === 0
                    ) {
                      singleImageSearch({
                        image: requestImages[0],
                        imageRegion: regions[0],
                        text: '',
                        settings,
                        showFeedback: false,
                        newSearch: false,
                      });
                    }
                    return;
                  }
                  setSpecifications(null);
                  setQuery('');
                  setValueInput('');
                  navigate('/');
                }}
              >
                <Icon name="close" className="w-3 h-3 text-primary" />
              </button>
            </Tooltip>
          )}
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
