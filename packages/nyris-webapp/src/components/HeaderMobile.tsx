import { Box, Button, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { ReactComponent as IconFilter } from 'common/assets/icons/filter_settings.svg';

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
    <Box style={{ width: '100%' }}>
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
                    style={{
                      alignItems: 'center',
                      flexDirection: 'row-reverse',
                    }}
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
                          {/* <img src={IconFilter} alt="" width={18} height={18} /> */}
                          <IconFilter />
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
                                  settings.themePage.searchSuite
                                    ?.secondaryColor,
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
                    backgroundColor:
                      preFilterDropdown || keyFilter
                        ? `${settings.themePage.searchSuite?.secondaryColor}26`
                        : '#fff',
                    margin: '0 12px',
                  }}
                >
                  {preFilterDropdown ? (
                    <CloseIcon
                      style={{
                        fontSize: 16,
                        color: settings.themePage.searchSuite?.secondaryColor,
                      }}
                    />
                  ) : (
                    <IconFilter
                      color={
                        keyFilter
                          ? settings.themePage.searchSuite?.secondaryColor
                          : '#000'
                      }
                    />
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </Box>
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
    </Box>
  );
}

const HeaderMobile = connectSearchBox<any>(memo(HeaderMobileComponent));
export default HeaderMobile;
