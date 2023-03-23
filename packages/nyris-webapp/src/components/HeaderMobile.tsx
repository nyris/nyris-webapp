import { Box, Button, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { ReactComponent as IconFilter } from 'common/assets/icons/filter_settings.svg';

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { connectSearchBox } from 'react-instantsearch-dom';
import { useMediaQuery } from 'react-responsive';
import { NavLink, useHistory } from 'react-router-dom';
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
import CustomSearchBox from './input/inputSearch';
import { ReactComponent as IconSearch } from 'common/assets/icons/icon_search.svg';
import { debounce, isEmpty } from 'lodash';
import { useQuery } from 'hooks/useQuery';

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
  const query = useQuery();
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const containerRefInputMobile = useRef<HTMLDivElement>(null);
  const [isShowInputSearch, setShowInputSearch] = useState<boolean>(false);
  const [isShowFilter, setShowFilter] = useState<boolean>(false);
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
    if (imageThumbSearchInput !== '') {
      history.push('/result');
      dispatch(updateValueTextSearchMobile(''));
      refine('');
    }
  }, [imageThumbSearchInput, dispatch, refine, history]);

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

  useEffect(() => {
    const searchQuery = query.get('query') || '';
    if (!isEmpty(searchQuery)) {
      dispatch(updateValueTextSearchMobile(searchQuery));
      refine(searchQuery);
      // not an ideal solution: fixes text search not working from landing page
      setTimeout(() => {
        refine(searchQuery);
      }, 100);
    }
  }, [query, refine, dispatch]);

  const searchOrRedirect = useCallback(
    debounce((value: any) => {
      if (value) {
        history.push({
          pathname: '/result',
          search: `?query=${value}`,
        });
      } else {
        history.push('/result');
      }
    }, 500),
    [],
  );

  const onChangeText = (event: any) => {
    // debounceSearch(event.currentTarget.value);
    searchOrRedirect(event.currentTarget.value);
    if (event.currentTarget.value === '') {
      dispatch(updateValueTextSearchMobile(''));
      refine('');
    } else {
      dispatch(updateValueTextSearchMobile(event.currentTarget.value));
    }
  };
  return (
    <Box style={{ width: '100%' }}>
      <Box
        className="box-content"
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '40px',
          borderBottom: '1px solid #e9e9ec',
          background: settings.themePage.searchSuite?.headerColor,
        }}
      >
        <NavLink
          to="/"
          style={{ lineHeight: 0, paddingLeft: '10px' }}
          onClick={() => {
            dispatch(reset(''));
          }}
        >
          {/* <section id="branding" style={{ height: 32 }} /> */}
          <img
            // width={90}
            // height={30}
            src={settings.themePage.searchSuite?.appBarLogoUrl}
            alt={settings.themePage.searchSuite?.appBarLogoUrlAlt}
            style={{ aspectRatio: 1, width: '110px', height: '24px' }}
          />
        </NavLink>
      </Box>
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
                  <img
                    src={imageThumbSearchInput}
                    style={{ maxWidth: '39px', objectFit: 'contain' }}
                    alt="img_search"
                  />
                  <button
                    style={{
                      backgroundColor: `${settings.themePage.searchSuite?.secondaryColor}26`,
                    }}
                    onClick={() => {
                      if (textSearchInputMobile) {
                        dispatch(setImageSearchInput(''));
                        dispatch(onResetRequestImage(''));
                        // setTimeout(() => {
                        //   refine(textSearchInputMobile);
                        // }, 300);
                        // setTimeout(() => {
                        //   setResetImage(false);
                        // }, 1000);
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
                    }}
                  >
                    {!textSearchInputMobile && (
                      <Box
                        style={{
                          paddingLeft: '8px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <IconSearch width={20} height={20} />
                      </Box>
                    )}
                    <Input
                      value={textSearchInputMobile}
                      onChange={onChangeText}
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
                                history.push('/result');
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
                        : '#f3f3f5',
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
          className="ml-auto mr-auto"
          style={{
            display: 'flex',
            columnGap: '16px',
            alignItems: 'center',
            // justifyContent: 'space-between',
            // margin: '12px 12px 5px 12px',
            marginTop: '12px',
            marginBottom: '5px',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}
        >
          <Typography color="textPrimary">Pre-filter:</Typography>
          <Box
            className="box-key-filter"
            style={{
              display: 'inline-flex',
              border: '2px solid black',
              borderRadius: 3,
              padding: '2px 5px',
              background: '#efefef',
              color: 'black',
              alignItems: 'center',
            }}
          >
            <Typography>{keyFilter}</Typography>
            <Button
              style={{ paddingRight: '0px' }}
              onClick={() => dispatch(setUpdateKeyFilterDesktop(''))}
            >
              <CloseIcon
                style={{
                  fontSize: 16,
                  color: '#2B2C46',
                }}
              />
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

const HeaderMobile = connectSearchBox<any>(memo(HeaderMobileComponent));
export default HeaderMobile;

const INPUT_ID = 'mobile-input-search';

const Input = ({ value, onChange }: any) => {
  useEffect(() => {
    const element = document.getElementById(INPUT_ID);
    const inputEventFn = (keyboardEvent: any) => {
      if (keyboardEvent.key === 'Enter') {
        element?.blur();
      }
    };

    element?.addEventListener('keyup', inputEventFn, false);

    return () => {
      element?.removeEventListener('scroll', inputEventFn, false);
    };
  }, []);

  return (
    <input
      style={{
        border: '0px',
        width: '100%',
        fontSize: 14,
        paddingLeft: '12px',
        paddingRight: '4px',
        color: '#2B2C46',
        fontStyle: 'italic',
        outline: 'none',
      }}
      className="input-search"
      placeholder="Search"
      value={value}
      onChange={onChange}
      id={INPUT_ID}
    />
  );
};
