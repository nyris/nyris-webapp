import { Box, Button } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { ReactComponent as IconFilter } from 'common/assets/icons/filter_settings.svg';

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { connectSearchBox, connectStateResults } from 'react-instantsearch-dom';
import { NavLink, useHistory } from 'react-router-dom';
import {
  reset,
  updateValueTextSearchMobile,
  setPreFilterDropdown,
  setPreFilter,
} from 'Store/search/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { AppState } from 'types';
import { ReactComponent as IconSearch } from 'common/assets/icons/icon_search.svg';
import { ReactComponent as FilterIcon } from 'common/assets/icons/filter.svg';

import { debounce, isEmpty } from 'lodash';
import { useQuery } from 'hooks/useQuery';

interface Props {
  onToggleFilterMobile?: any;
  refine?: any;
  allSearchResults?: any;
}

function HeaderMobileComponent(props: Props): JSX.Element {
  const { onToggleFilterMobile, refine } = props;
  const dispatch = useAppDispatch();
  const stateGlobal = useAppSelector(state => state);
  const { search } = stateGlobal;
  const {
    imageThumbSearchInput,
    textSearchInputMobile,
    preFilter,
    preFilterDropdown,
    valueTextSearch,
  } = search;
  const query = useQuery();
  const containerRefInputMobile = useRef<HTMLDivElement>(null);
  const [isShowFilter, setShowFilter] = useState<boolean>(false);
  const history = useHistory();
  const { settings } = useAppSelector<AppState>((state: any) => state);

  useEffect(() => {
    if (
      history.location?.pathname === '/result' &&
      (imageThumbSearchInput || textSearchInputMobile)
    ) {
      setShowFilter(true);
    } else {
      setShowFilter(false);
    }
  }, [imageThumbSearchInput, history.location, textSearchInputMobile]);

  useEffect(() => {
    if (imageThumbSearchInput !== '') {
      history.push('/result');
      dispatch(updateValueTextSearchMobile(''));
      refine('');
    }
  }, [imageThumbSearchInput, dispatch, refine, history]);

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
  const isPostFilterApplied = useMemo(() => {
    let isApplied = false;
    if (!valueTextSearch?.refinementList) return false;
    Object.keys(valueTextSearch?.refinementList).forEach(key => {
      if (typeof valueTextSearch.refinementList[key] === 'object') {
        isApplied = true;
        return;
      }
    });
    return isApplied;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueTextSearch?.refinementList]);

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
  const disablePostFilter = useMemo(() => {
    return settings.postFilterOption && props.allSearchResults?.hits.length > 0
      ? false
      : true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.postFilterOption, props.allSearchResults?.hits]);

  return (
    <div style={{ width: '100%', background: '#fafafa' }}>
      {history.location?.pathname !== '/result' && (
        <Box
          className="box-content"
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '48px',
            borderBottom: '1px solid #e9e9ec',
            background: settings.theme?.headerColor,
          }}
        >
          <NavLink
            to="/"
            style={{ lineHeight: 0, paddingLeft: '10px' }}
            onClick={() => {
              dispatch(reset(''));
              dispatch(setPreFilter({}));
            }}
          >
            <img
              src={settings.theme?.appBarLogoUrl}
              alt="logo"
              style={{
                aspectRatio: 1,
                width: settings.theme?.logoWidth,
                height: settings.theme?.logoHeight,
              }}
            />
          </NavLink>
        </Box>
      )}
      <div
        style={{
          margin: '16px 8px 0px 8px',
          display: 'flex',
          columnGap: '8px',
          alignItems: 'center',
        }}
      >
        <div className="wrap-header-mobile" style={{ height: '56px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <div
              ref={containerRefInputMobile}
              id="box-input-search"
              className="d-flex w-100"
              style={{
                alignItems: 'center',
                height: '100%',
              }}
            >
              <Box
                className="pre-filter-icon"
                onClick={() => {
                  if (settings.preFilterOption) {
                    onToggleFilterMobile(false);
                    dispatch(setPreFilterDropdown(!preFilterDropdown));
                  }
                }}
                style={{ cursor: settings.preFilterOption ? 'pointer' : '' }}
              >
                {settings.preFilterOption && (
                  <div
                    className="icon-hover"
                    style={{
                      ...(!isEmpty(preFilter)
                        ? {
                            backgroundColor: `${settings.theme?.primaryColor}`,
                          }
                        : {
                            backgroundColor: `#2B2C46`,
                          }),
                    }}
                  >
                    <IconFilter color="white" />
                  </div>
                )}
                {!settings.preFilterOption && (
                  <IconSearch width={16} height={16} />
                )}
                {!isEmpty(preFilter) && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '31px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      background: 'white',
                      width: '10px',
                      height: '10px',
                      borderRadius: '100%',
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        background: settings.theme?.primaryColor,
                        borderRadius: '100%',
                      }}
                    ></div>
                  </div>
                )}
              </Box>

              <Input value={textSearchInputMobile} onChange={onChangeText} />

              {history.location?.pathname !== '/' && textSearchInputMobile && (
                <Button
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
                    // background: '#fff',
                    marginRight: '8px',
                    border: 0,
                    width: '40px',
                    height: '40px',
                  }}
                >
                  <CloseIcon
                    style={{
                      fontSize: 16,
                      color: settings.theme?.secondaryColor,
                    }}
                  />
                </Button>
              )}
            </div>
          </div>
        </div>
        {isShowFilter && settings.postFilterOption && (
          <div
            style={{
              position: 'relative',
              width: '56px',
              height: '56px',
              padding: ' 8px',
              flexShrink: 0,
              borderRadius: '32px',
              background: '#FAFAFA',
              boxShadow: ' 0px 0px 8px 0px rgba(0, 0, 0, 0.15)',
            }}
            onClick={() => {
              if (disablePostFilter) return;
              onToggleFilterMobile();
              dispatch(setPreFilterDropdown(false));
            }}
          >
            <div
              style={{
                display: 'flex',
                background: `${
                  disablePostFilter ? '#F3F3F5' : settings.theme?.primaryColor
                }`,
                borderRadius: '40px',
                width: '40px',
                height: '40px',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <FilterIcon
                color={`${disablePostFilter ? '#E0E0E0' : 'white'}`}
              />
            </div>

            {isPostFilterApplied && !disablePostFilter && (
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '37px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: 'white',
                  width: '10px',
                  height: '10px',
                  borderRadius: '100%',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    background: settings.theme?.primaryColor,
                    borderRadius: '100%',
                  }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const HeaderMobile = connectSearchBox<any>(
  memo(connectStateResults<Props>(HeaderMobileComponent)),
);
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
        display: 'flex',
        flexGrow: 1,
        fontSize: 14,
        paddingLeft: '12px',
        paddingRight: '4px',
        color: '#2B2C46',
        outline: 'none',
        borderRadius: '32px',
      }}
      className="input-search"
      placeholder="Search"
      value={value}
      onChange={onChange}
      id={INPUT_ID}
    />
  );
};
