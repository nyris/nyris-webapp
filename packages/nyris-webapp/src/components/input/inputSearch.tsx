import { Button, Tooltip } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import { useQuery } from 'hooks/useQuery';
import { isEmpty } from 'lodash';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { connectSearchBox } from 'react-instantsearch-dom';
import { useHistory } from 'react-router-dom';

import {
  reset,
  updateStatusLoading,
  loadingActionResults,
  updateQueryText,
} from 'Store/search/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import DefaultModal from 'components/modal/DefaultModal';
import PreFilterComponent from 'components/pre-filter';
import { useTranslation } from 'react-i18next';
import { useAuth0 } from '@auth0/auth0-react';
import { useImageSearch } from 'hooks/useImageSearch';
import UploadDisclaimer from 'components/UploadDisclaimer';
import useRequestStore from 'Store/requestStore';
import { useSearchOrRedirect } from 'hooks/useSearchOrRedirect';
import { Icon } from '@nyris/nyris-react-components';
import { useCadSearch } from 'hooks/useCadSearch';
import { isCadFile } from '@nyris/nyris-api';

const SearchBox = (props: any) => {
  const { refine }: any = props;
  // const containerRefInputMobile = useRef<HTMLDivElement>(null);
  const preFilter = useAppSelector(state => state.search.preFilter);
  const settings = useAppSelector(state => state.settings);

  const focusInp: any = useRef<HTMLDivElement | null>(null);
  const history = useHistory();
  const [valueInput, setValueInput] = useState<string>('');
  const dispatch = useAppDispatch();
  const query = useQuery();
  const [isOpenModalFilterDesktop, setToggleModalFilterDesktop] =
    useState<boolean>(false);
  const { t } = useTranslation();
  const isAlgoliaEnabled = settings.algolia?.enabled;
  const searchbar = useRef<HTMLDivElement | null>(null);
  const { singleImageSearch } = useImageSearch();
  const { cadSearch } = useCadSearch();
  const { user } = useAuth0();
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const { requestImages } = useRequestStore(state => ({
    requestImages: state.requestImages,
  }));

  const isCadSearch = window.settings.cadSearch;

  const visualSearch = useMemo(() => requestImages.length > 0, [requestImages]);

  useEffect(() => {
    if (focusInp?.current) {
      focusInp?.current.focus();
    }
  }, [focusInp]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (searchbar.current) {
        if (searchbar.current.contains(event.target as Node)) {
          searchbar.current.classList.add('active');
        } else {
          searchbar.current.classList.remove('active');
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [searchbar]);

  useEffect(() => {
    const searchQuery = query.get('query') || '';
    if (!isEmpty(searchQuery)) {
      setValueInput(searchQuery);
      dispatch(updateQueryText(searchQuery));

      if (isAlgoliaEnabled) {
        refine(searchQuery);
        // not an ideal solution: fixes text search not working from landing page
        setTimeout(() => {
          refine(searchQuery);
        }, 100);
      }
    }
  }, [query, refine, dispatch, isAlgoliaEnabled]);

  useEffect(() => {
    if (visualSearch) {
      setValueInput('');
      if (isAlgoliaEnabled) {
        refine('');
      }
      history.push('/result');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualSearch, isAlgoliaEnabled, requestImages]);

  useEffect(() => {
    if (history.location?.pathname === '/') {
      setValueInput('');
      dispatch(updateQueryText(''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.location]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchOrRedirect = useSearchOrRedirect();

  const onImageUpload = async (fs: any) => {
    if (isCadFile(fs) && isCadSearch) {
      dispatch(updateStatusLoading(true));
      dispatch(loadingActionResults());
      if (history.location.pathname !== '/result') {
        history.push('/result');
      }
      cadSearch({ file: fs, settings, newSearch: true }).then(res => {
        dispatch(updateStatusLoading(false));
      });
    } else {
      dispatch(updateStatusLoading(true));
      dispatch(loadingActionResults());
      if (history.location.pathname !== '/result') {
        history.push('/result');
      }

      singleImageSearch({
        image: fs,
        settings,
        showFeedback: true,
        newSearch: true,
      }).then(() => {
        dispatch(updateStatusLoading(false));
      });
    }
  };

  const onChangeText = (event: any) => {
    setValueInput(event.currentTarget.value);

    searchOrRedirect(event.currentTarget.value);
    if (event.currentTarget.value === '') {
      setValueInput('');
      if (isAlgoliaEnabled) {
        refine('');
      }
    }
  };

  const showPreFilter = useMemo(() => {
    if (settings.shouldUseUserMetadata && user) {
      if (settings.preFilterOption && !user['/user_metadata'].value) {
        return true;
      }
      return false;
    }

    return settings.preFilterOption;
  }, [settings.preFilterOption, settings.shouldUseUserMetadata, user]);

  const showDisclaimerDisabled = useMemo(() => {
    const disclaimer = localStorage.getItem('upload-disclaimer-webapp');
    if (requestImages.length === 0) return true;
    if (!disclaimer) return false;
    return disclaimer === 'dont-show';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDisclaimer, requestImages]);

  return (
    <>
      {showDisclaimer && (
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
              localStorage.setItem('upload-disclaimer-webapp', 'dont-show');
            }
            onImageUpload(file);

            setShowDisclaimer(false);
          }}
          isMobile={false}
        />
      )}
      <div className="wrap-input-search-field">
        <div className="box-input-search d-flex">
          <div className="input-wrapper">
            <div className="box-inp">
              <Tooltip
                title={
                  !isEmpty(preFilter)
                    ? Object.keys(preFilter).join(', ')
                    : t('Add or change pre-filter')
                }
                placement="top"
                arrow={true}
                disableHoverListener={!showPreFilter}
              >
                <div
                  className="pre-filter-icon"
                  style={{
                    cursor: showPreFilter ? 'pointer' : 'default',
                  }}
                  onClick={() =>
                    showPreFilter ? setToggleModalFilterDesktop(true) : false
                  }
                >
                  {showPreFilter && (
                    <div
                      className="icon-hover desktop"
                      style={{
                        ...(!isEmpty(preFilter)
                          ? {
                              backgroundColor: `${settings.theme?.primaryColor}`,
                            }
                          : {
                              backgroundColor: '#2B2C46',
                            }),
                      }}
                    >
                      <Icon name="filter_settings" color="white" />
                    </div>
                  )}
                  {!showPreFilter && (
                    <Icon name="search" width={16} height={16} />
                  )}
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
              </Tooltip>

              <input
                style={{
                  border: '0px',
                  width: '100%',
                  fontSize: 14,
                  color: '#2B2C46',
                }}
                className="input-search hhhh"
                placeholder={t('Search')}
                value={valueInput}
                onChange={onChangeText}
                ref={focusInp}
              />
            </div>

            {history.location.pathname === '/result' && valueInput && (
              <Button
                className="btn-clear-text"
                onClick={() => {
                  if (visualSearch) {
                    history.push('/result');
                    if (!isAlgoliaEnabled) {
                      searchOrRedirect('');
                    }
                    setValueInput('');
                    if (isAlgoliaEnabled) {
                      refine('');
                    }
                    return;
                  }
                  setValueInput('');
                  if (isAlgoliaEnabled) {
                    refine('');
                  }
                  dispatch(reset(''));
                  history.push('/');
                }}
              >
                <Tooltip
                  title={t('Clear text search')}
                  placement="top"
                  arrow={true}
                >
                  <ClearOutlinedIcon
                    style={{ fontSize: 16, color: '#2B2C46' }}
                  />
                </Tooltip>
              </Button>
            )}
            <div className="wrap-box-input-mobile d-flex">
              <input
                accept={`${isCadSearch ? '.stp,.step,' : ''}image/*`}
                id="icon-button-file"
                type="file"
                style={{ display: 'none' }}
                onClick={e => {
                  e.stopPropagation();
                }}
                onChange={e => {
                  if (e?.target?.files) {
                    const file = e?.target?.files[0];

                    onImageUpload(file);
                  }
                }}
              />
              <Tooltip
                title={t('Search with an image')}
                placement="top"
                arrow={true}
              >
                <label
                  htmlFor={showDisclaimerDisabled ? 'icon-button-file' : ''}
                  onClick={e => {
                    if (!showDisclaimerDisabled) {
                      setShowDisclaimer(true);
                    }
                  }}
                >
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="span"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '100%',
                      padding: 7,
                    }}
                  >
                    <Icon
                      name="camera_simple"
                      width={18}
                      height={18}
                      fill="#2B2C46"
                    />
                  </IconButton>
                </label>
              </Tooltip>
            </div>
          </div>
        </div>
        {showPreFilter && (
          <DefaultModal
            openModal={isOpenModalFilterDesktop}
            handleClose={() => setToggleModalFilterDesktop(false)}
            classNameModal="wrap-filter-desktop"
            classNameComponentChild="bg-white box-filter-desktop"
          >
            <PreFilterComponent
              handleClose={() => setToggleModalFilterDesktop(false)}
            />
          </DefaultModal>
        )}
      </div>
    </>
  );
};

const CustomSearchBox = connectSearchBox<any>(memo(SearchBox));
export default CustomSearchBox;
