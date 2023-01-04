import { Box, Button, Typography } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import CloseIcon from '@material-ui/icons/Close';
import IconCamera from 'common/assets/icons/camera.svg';
import IconFilter from 'common/assets/icons/filter_settings.svg';
import IconSearch from 'common/assets/icons/icon_search.svg';
import { useQuery } from 'hooks/useQuery';
import { debounce, isEmpty } from 'lodash';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { connectSearchBox } from 'react-instantsearch-dom';
import { useMediaQuery } from 'react-responsive';
import { useHistory } from 'react-router-dom';
import { createImage, findByImage } from 'services/image';
import {
  reset,
  setImageSearchInput,
  setRequestImage,
  setSearchResults,
  updateStatusLoading,
  setUpdateKeyFilterDesktop,
} from 'Store/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import DefaultModal from 'components/modal/DefaultModal';
import FilterComponent from 'components/pre-filter/desktop';

const SearchBox = (props: any) => {
  const { refine, onToggleFilterMobile }: any = props;
  // const containerRefInputMobile = useRef<HTMLDivElement>(null);
  const stateGlobal = useAppSelector(state => state);
  const { search, settings } = stateGlobal;
  const { imageThumbSearchInput, valueTextSearch, keyFilter } = search;
  const focusInp: any = useRef<HTMLDivElement | null>(null);
  const history = useHistory();
  const [valueInput, setValueInput] = useState<string>('');
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const query = useQuery();
  const [isOpenModalFilterDesktop, setToggleModalFilterDesktop] =
    useState<boolean>(false);

  useEffect(() => {
    if (focusInp?.current) {
      focusInp?.current.focus();
    }
  }, [focusInp]);

  useEffect(() => {
    const searchQuery = query.get('query') || '';
    if (!isEmpty(searchQuery)) {
      setValueInput(searchQuery);
      refine(searchQuery);
    }
  }, [query, refine]);

  useEffect(() => {
    if (imageThumbSearchInput) {
      setValueInput('');
      refine('');
    }
  }, [imageThumbSearchInput]);

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

  const { getInputProps } = useDropzone({
    onDrop: async (fs: File[]) => {
      dispatch(updateStatusLoading(true));
      if (history.location.pathname !== '/result') {
        history.push('/result');
      }
      let payload: any;
      let filters: any[] = [];
      dispatch(setImageSearchInput(URL.createObjectURL(fs[0])));
      let image = await createImage(fs[0]);
      dispatch(setRequestImage(image));
      const preFilter = [
        {
          key: settings.filterType,
          values: [`${keyFilter}`],
        },
      ];

      return findByImage({
        image,
        settings,
        filters: keyFilter ? preFilter : undefined,
      })
        .then((res: any) => {
          res?.results.map((item: any) => {
            filters.push({
              sku: item.sku,
              score: item.score,
            });
          });
          payload = {
            ...res,
            filters,
          };
          dispatch(setSearchResults(payload));
          dispatch(updateStatusLoading(false));
        })
        .catch((e: any) => {
          console.log('error input search', e);
          dispatch(updateStatusLoading(false));
        });
    },
  });

  const onChangeText = (event: any) => {
    setValueInput(event.currentTarget.value);
    // debounceSearch(event.currentTarget.value);
    searchOrRedirect(event.currentTarget.value);
    if (event.currentTarget.value === '') {
      setValueInput('');
      refine('');
    }
  };
  return (
    <Box className="wrap-input-search">
      <div style={{ padding: 10 }} className="box-input-search d-flex">
        <form noValidate action="" role="search">
          <Box className="box-inp">
            <Box
              style={{
                height: '100%',
                order: 1,
                paddingLeft: imageThumbSearchInput || keyFilter ? 0 : 10,
              }}
            >
              {imageThumbSearchInput && (
                <Box
                  style={{
                    border: `2px solid ${settings.themePage.searchSuite?.secondaryColor}c7`,
                    backgroundColor: `${settings.themePage.searchSuite?.secondaryColor}26`,
                  }}
                  className="box-image-search-thumb"
                  display={'flex'}
                >
                  <img src={imageThumbSearchInput} alt="img_search" />
                  <button
                    onClick={() => {
                      if (!valueInput) {
                        dispatch(reset(''));
                        history.push('/');
                      }
                      dispatch(reset(''));
                      refine(valueInput);
                    }}
                  >
                    <CloseIcon
                      style={{
                        fontSize: 20,
                        color: settings.themePage.searchSuite?.secondaryColor,
                      }}
                    />
                  </button>
                </Box>
              )}
            </Box>

            {!keyFilter && (
              <Box
                className="icon-search"
                style={
                  imageThumbSearchInput
                    ? { order: 2, marginLeft: 5 }
                    : { order: 2 }
                }
              >
                <img src={IconSearch} alt="" width={24} height={24} />
              </Box>
            )}

            {keyFilter && (
              <Box
                className="box-key-filter"
                style={{ order: 0, marginRight: 5 }}
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

            <input
              style={{
                border: '0px',
                width: '100%',
                fontSize: 14,
                color: '#2B2C46',
                fontStyle: 'italic',
              }}
              className="input-search"
              placeholder="Search"
              value={valueInput}
              onChange={onChangeText}
              ref={focusInp}
              disabled={
                !!(
                  settings.preFilterOption &&
                  keyFilter &&
                  !imageThumbSearchInput
                )
              }
            />
          </Box>

          {history.location.pathname === '/result' && (
            <Button
              className="btn-clear-text"
              onClick={() => {
                if (imageThumbSearchInput) {
                  setValueInput('');
                  refine('');
                  return;
                }
                setValueInput('');
                refine('');
                dispatch(reset(''));
                history.push('/');
              }}
            >
              <ClearOutlinedIcon style={{ fontSize: 12, color: '#2B2C46' }} />
            </Button>
          )}
          {!isMobile ? (
            <div className="wrap-box-input-mobile d-flex">
              {settings.preFilterOption && (
                <Button
                  onClick={() => setToggleModalFilterDesktop(true)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '100%',
                    backgroundColor: '#fff',
                  }}
                >
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
                </Button>
              )}
              <input
                accept="image/*"
                id="icon-button-file"
                type="file"
                style={{ display: 'none' }}
                {...getInputProps({
                  onClick: e => {
                    e.stopPropagation();
                  },
                })}
              />
              <label htmlFor="icon-button-file">
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="span"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '100%',
                    padding: 7,
                    backgroundColor: '#F3F3F5',
                  }}
                >
                  <img src={IconCamera} alt="" width={18} height={18} />
                </IconButton>
              </label>
            </div>
          ) : (
            <Box>
              <Button
                className="btn-mobile-filter"
                onClick={onToggleFilterMobile}
              >
                <img src={IconFilter} alt="" width={18} height={18} />
              </Button>
            </Box>
          )}
        </form>
      </div>
      {!!(settings.preFilterOption && keyFilter && !imageThumbSearchInput) && (
        <Typography style={{ fontSize: 11, textAlign: 'center', marginTop: 5 }}>
          Upload image to search with pre-filtering.
        </Typography>
      )}
      {settings.preFilterOption && (
        <DefaultModal
          openModal={isOpenModalFilterDesktop}
          handleClose={() => setToggleModalFilterDesktop(false)}
          classNameModal="wrap-filter-destop"
          classNameComponentChild="bg-white box-filter-destop"
        >
          <FilterComponent
            handleClose={() => setToggleModalFilterDesktop(false)}
          />
        </DefaultModal>
      )}
    </Box>
  );
};

const CustomSearchBox = connectSearchBox<any>(memo(SearchBox));
export default CustomSearchBox;
