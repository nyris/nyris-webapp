import { Box, Button, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import IconFilter from 'common/assets/icons/filter_settings.svg';
import React, { memo, useEffect, useRef, useState } from 'react';
import { connectSearchBox } from 'react-instantsearch-dom';
import { useMediaQuery } from 'react-responsive';
import { useHistory } from 'react-router-dom';
import {
  onResetRequestImage,
  reset,
  setImageSearchInput,
  updateValueTextSearchMobile,
  setUpdateKeyFilterDesktop,
  setPreFilterDropdown,
} from 'Store/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { AppState } from 'types';
import AutocompleteBasicMobileComponent from './auto-complete/basic';
import CustomSearchBox from './input/inputSearch';
interface Props {
  onToggleFilterMobile?: any;
  refine?: any;
}

function HeaderMobileComponent(props: Props): JSX.Element {
  const { onToggleFilterMobile, refine } = props;
  const dispatch = useAppDispatch();
  const stateGlobal = useAppSelector(state => state);
  const { search } = stateGlobal;
  const {
    imageThumbSearchInput,
    textSearchInputMobile,
    keyFilter,
    preFilterDropdown,
  } = search;
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const containerRefInputMobile = useRef<HTMLDivElement>(null);
  const [isShowInputSearch, setShowInputSearch] = useState<boolean>(false);
  const [isShowFilter, setShowFilter] = useState<boolean>(false);
  const [isResetImage, setResetImage] = useState<boolean>(false);
  const history = useHistory();
  const { settings } = useAppSelector<AppState>((state: any) => state);

  useEffect(() => {
    if (history.location?.pathname === '/result') {
      setShowFilter(true);
    } else {
      setShowFilter(false);
    }
  }, [history.location]);

  useEffect(() => {
    if (
      history.location?.pathname === '/result' ||
      history.location?.pathname === '/'
    ) {
      setShowInputSearch(true);
    } else {
      setShowInputSearch(false);
    }
  }, [history.location]);

  return (
    <Box className="wrap-header-mobile">
      {!isMobile ? (
        <CustomSearchBox onToggleFilterMobile={onToggleFilterMobile} />
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {imageThumbSearchInput && (
              <div
                style={{
                  border: `2px solid ${settings.themePage.searchSuite?.secondaryColor}c7`,
                  backgroundColor: `${settings.themePage.searchSuite?.secondaryColor}26`,
                }}
                className="box-image-search-thumb-mobile"
              >
                <img src={imageThumbSearchInput} alt="img_search" />
                <button
                  style={{
                    backgroundColor: `${settings.themePage.searchSuite?.secondaryColor}26`,
                  }}
                  onClick={() => {
                    if (textSearchInputMobile) {
                      dispatch(setImageSearchInput(''));
                      dispatch(onResetRequestImage(''));
                      setResetImage(true);
                      setTimeout(() => {
                        setResetImage(false);
                      }, 1000);
                      return;
                    }
                    dispatch(reset(''));
                    history.push('/');
                  }}
                >
                  <CloseIcon
                    style={{
                      fontSize: 20,
                      color: settings.themePage.searchSuite?.secondaryColor,
                      fontWeight: 700,
                    }}
                  />
                </button>
              </div>
            )}
            {isShowInputSearch && (
              <>
                <div
                  ref={containerRefInputMobile}
                  id="box-input-search"
                  className="d-flex w-100"
                  style={{ alignItems: 'center', flexDirection: 'row-reverse' }}
                >
                  <AutocompleteBasicMobileComponent
                    containerRefInputMobile={containerRefInputMobile}
                    isiImageThumbSearchInput={
                      imageThumbSearchInput ? true : false
                    }
                    isResetImage={isResetImage}
                  />

                  {isShowFilter && settings.postFilterOption && (
                    <Box className="box-button-input-mobile">
                      <Button
                        className="btn-mobile-filter"
                        onClick={onToggleFilterMobile}
                      >
                        <img src={IconFilter} alt="" width={18} height={18} />
                      </Button>
                    </Box>
                  )}
                  {history.location?.pathname !== '/' &&
                    textSearchInputMobile && (
                      <Box
                        className="btn-close-header"
                        style={{ backgroundColor: '#fff' }}
                      >
                        <button
                          onClick={() => {
                            if (imageThumbSearchInput) {
                              dispatch(updateValueTextSearchMobile(''));
                              refine('');
                              return;
                            }
                            dispatch(updateValueTextSearchMobile(''));
                            dispatch(reset(''));
                            refine('');
                            history.push('/');
                          }}
                          style={{
                            backgroundColor: '#fff',
                            border: 0,
                            padding: '0px 16px 0 0px',
                            display: 'flex',
                          }}
                        >
                          <CloseIcon
                            style={{
                              fontSize: 20,
                              color:
                                settings.themePage.searchSuite?.secondaryColor,
                            }}
                          />
                        </button>
                      </Box>
                    )}
                </div>
              </>
            )}
            {settings.preFilterOption && (
              <Button
                onClick={() => {
                  dispatch(setPreFilterDropdown(!preFilterDropdown));
                }}
                style={{
                  order: 3,
                  width: 32,
                  height: 32,
                  borderRadius: '100%',
                  backgroundColor: '#fff',
                  margin: '0 12px',
                  boxShadow: '1px 2px 3px #91919180',
                }}
              >
                {preFilterDropdown ? (
                  <CloseIcon
                    style={{
                      fontSize: 12,
                      color: '#2B2C46',
                    }}
                  />
                ) : (
                  <svg
                    width="14"
                    height="12"
                    viewBox="0 0 14 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M14 2H11.95C11.7 0.85 10.7 0 9.5 0C8.3 0 7.3 0.85 7.05 2H0V3H7.05C7.3 4.15 8.3 5 9.5 5C10.7 5 11.7 4.15 11.95 3H14V2ZM9.5 4C8.65 4 8 3.35 8 2.5C8 1.65 8.65 1 9.5 1C10.35 1 11 1.65 11 2.5C11 3.35 10.35 4 9.5 4ZM0 10H2.05C2.3 11.15 3.3 12 4.5 12C5.7 12 6.7 11.15 6.95 10H14V9H6.95C6.7 7.85 5.7 7 4.5 7C3.3 7 2.3 7.85 2.05 9H0V10ZM4.5 8C5.35 8 6 8.65 6 9.5C6 10.35 5.35 11 4.5 11C3.65 11 3 10.35 3 9.5C3 8.65 3.65 8 4.5 8Z"
                      fill="#1E1F31"
                    />
                  </svg>
                )}
              </Button>
            )}
          </div>
          {keyFilter && isMobile && (
            <Box
              className="box-key-filter"
              style={{
                display: 'inline-flex',
                margin: '12px 5px 5px 5px',
                border: '2px solid black',
                borderRadius: 3,
                padding: '2px 7px',
                background: '#efefef',
                color: 'black',
              }}
            >
              <Typography>{keyFilter}</Typography>
              <Button
                onClick={() => dispatch(setUpdateKeyFilterDesktop(''))}
                style={{ padding: '6px 2px' }}
              >
                <CloseIcon
                  style={{
                    fontSize: 12,
                    color: '#2B2C46',
                  }}
                />
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

const HeaderMobile = connectSearchBox<any>(memo(HeaderMobileComponent));
export default HeaderMobile;
