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
import ImageUpload from './ImageUpload';
import useUiStore from 'stores/ui/uiStore';
import useConversationStore from 'stores/chat/conversationStore';

function TextSearch({
  className,
  onCameraClick,
  showImageUpload = true,
  aiMode = false,
}: {
  className?: string;
  onCameraClick?: () => void;
  showImageUpload?: boolean;
  aiMode?: boolean;
}) {
  const settings = window.settings;
  const user = useAuth0().user;

  const focusInp: any = useRef<HTMLDivElement | null>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();

  const toggleAiMode = useUiStore(state => state.toggleAiMode);
  const isAiModeOpen = useUiStore(state => state.isAiModeOpen);
  const hasAiNotification = useConversationStore(
    state => state.hasNotification,
  );
  const setIsChatOpen = useConversationStore(state => state.setIsOpen);

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
  const [isInputFocused, setIsInputFocused] = useState(false);

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
        'w-[636px]',
        'h-12',
        location.pathname === '/result' && 'desktop:h-[52px]',
        className,
      )}
    >
      <div
        className={twMerge([
          'bg-white',
          location.pathname === '/result' &&
            'desktop:bg-[#E7E8F1] desktop:has-[input:focus]:bg-[#FFFFFF] desktop:has-[input:focus]:shadow-ds-2',
          'border border-solid',
          'border-[#DDDEE7]',
          location.pathname !== '/result' && 'shadow-ds-2',
          location.pathname === '/result' && 'shadow-ds-2 desktop:shadow-none',
          'flex',
          'h-full',
          'justify-between',
          'pr-1.5',
          'rounded-[32px]',
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
                'py-2',
                'px-2',
                'desktop:py-1.5',
                'desktop:pl-1.5',
                'pr-1.5',
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
                      'p-2 desktop:p-3',
                      location.pathname === '/result' && 'desktop:p-3',
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
                        `desktop:fill-[#3B3E5F]`,
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
              className={twMerge(
                'peer pl-1.5 outline-none',
                'bg-white',
                location.pathname === '/result' &&
                  'desktop:bg-[#E7E8F1] focus:bg-[#FFFFFF]',
              )}
              placeholder={t('Search')}
              value={valueInput}
              onChange={onChangeText}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              ref={focusInp}
            />
          </div>
          <div className="flex gap-2">
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
                    location.pathname === '/result' &&
                      'desktop:min-w-10 desktop:min-h-10',
                  ])}
                  onPointerDown={event => {
                    // Keep focus on input until click runs so mobile AI button doesn't pop in first.
                    event.preventDefault();
                  }}
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
            {showImageUpload && <ImageUpload onCameraClick={onCameraClick} />}
            {aiMode &&
              window.settings.vizo?.chat &&
              requestImages.length !== 0 &&
              !(isMobile && isInputFocused) && (
                <div className="relative">
                  <button
                    type="button"
                    className={twMerge(
                      'px-[10px] h-10 rounded-full text-[14px] text-[#989BB7] flex items-center justify-center gap-2 whitespace-nowrap bg-[#FAFAFA] border border-solid border-transparent',
                      !isAiModeOpen &&
                        'hover:bg-gradient-to-r hover:from-white hover:to-[#E4E3FF]',
                      !isAiModeOpen &&
                        'hover:border-[#DDDEE7] hover:text-[#3B3E5F]',
                      isAiModeOpen &&
                        'bg-[#3B3E5F] text-white hover:bg-[#3B3E5F]',
                    )}
                    onClick={() => {
                      const nextIsAiModeOpen = !isAiModeOpen;
                      toggleAiMode();
                      setIsChatOpen(nextIsAiModeOpen);
                    }}
                  >
                    <Icon
                      name="search_ai"
                      width={14}
                      height={14}
                      className={twMerge(
                        'text-[#3B3E5F]',
                        isAiModeOpen && 'text-white',
                      )}
                    />
                    AI mode
                  </button>

                  {hasAiNotification && !isAiModeOpen && (
                    <>
                      <span
                        className="absolute -top-0.5 right-1 w-3 h-3 rounded-full border-2 border-solid border-white"
                        style={{
                          background: window.settings?.theme?.primaryColor,
                        }}
                      />
                    </>
                  )}
                </div>
              )}
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
