import { Box, Button, Tooltip } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import CloseIcon from '@material-ui/icons/Close';
import IconCamera from 'common/assets/icons/camera.svg';
import { useQuery } from 'hooks/useQuery';
import { debounce, isEmpty } from 'lodash';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { connectSearchBox } from 'react-instantsearch-dom';
import { useMediaQuery } from 'react-responsive';
import { useHistory } from 'react-router-dom';
import { createImage, findByImage, findRegions } from 'services/image';
import { ReactComponent as IconFilter } from 'common/assets/icons/filter_settings.svg';
import { ReactComponent as IconSearch } from 'common/assets/icons/icon_search.svg';

import {
  reset,
  setImageSearchInput,
  setRequestImage,
  setSearchResults,
  updateStatusLoading,
  loadingActionResults,
  setRegions,
  setSelectedRegion,
} from 'Store/search/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import DefaultModal from 'components/modal/DefaultModal';
import PreFilterComponent from 'components/pre-filter';
import { RectCoords } from '@nyris/nyris-api';
import { useTranslation } from 'react-i18next';

const SearchBox = (props: any) => {
  const { refine, onToggleFilterMobile }: any = props;
  // const containerRefInputMobile = useRef<HTMLDivElement>(null);
  const stateGlobal = useAppSelector(state => state);
  const { search, settings } = stateGlobal;
  const { imageThumbSearchInput, preFilter } = search;
  const focusInp: any = useRef<HTMLDivElement | null>(null);
  const history = useHistory();
  const [valueInput, setValueInput] = useState<string>('');
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const query = useQuery();
  const [isOpenModalFilterDesktop, setToggleModalFilterDesktop] =
    useState<boolean>(false);
  const { t } = useTranslation();
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
      // not an ideal solution: fixes text search not working from landing page
      setTimeout(() => {
        refine(searchQuery);
      }, 100);
    }
  }, [query, refine]);

  useEffect(() => {
    if (imageThumbSearchInput) {
      setValueInput('');
      refine('');
      history.push('/result');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      dispatch(loadingActionResults());
      if (history.location.pathname !== '/result') {
        history.push('/result');
      }
      let payload: any;
      let filters: any[] = [];
      let region: RectCoords | undefined;

      dispatch(setImageSearchInput(URL.createObjectURL(fs[0])));
      let image = await createImage(fs[0]);
      dispatch(setRequestImage(image));
      const preFilterValues = [
        {
          key: settings.visualSearchFilterKey,
          values: Object.keys(preFilter) as string[],
        },
      ];

      if (settings.regions) {
        let res = await findRegions(image, settings);
        dispatch(setRegions(res.regions));
        region = res.selectedRegion;
        dispatch(setSelectedRegion(region));
      }

      return findByImage({
        image,
        settings,
        filters: !isEmpty(preFilter) ? preFilterValues : undefined,
        region,
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
    <div className="wrap-input-search-field">
      <div className="box-input-search d-flex">
        <form noValidate action="" role="search">
          <Box className="box-inp">
            <Tooltip
              title={
                !isEmpty(preFilter)
                  ? Object.keys(preFilter).join(', ')
                  : 'Add pre-filter'
              }
              placement="top"
              arrow={true}
              disableHoverListener={!settings.preFilterOption}
            >
              <Box
                className="pre-filter-icon"
                style={{
                  cursor: settings.preFilterOption ? 'pointer' : 'default',
                }}
                onClick={() =>
                  settings.preFilterOption
                    ? setToggleModalFilterDesktop(true)
                    : false
                }
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
                            backgroundColor: `${settings.theme?.secondaryColor}`,
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
                      top: '5px',
                      left: '35px',
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
              </Box>
            </Tooltip>
            <Box
              style={{
                height: '75%',
                order: 1,
              }}
            >
              {imageThumbSearchInput && (
                <Box
                  style={{
                    border: `2px solid ${settings.theme?.primaryColor}`,
                    backgroundColor: '#E4E3FF',
                    marginRight: '5px',
                  }}
                  className="box-image-search-thumb"
                  display={'flex'}
                >
                  <img
                    src={imageThumbSearchInput}
                    style={{ objectFit: 'contain' }}
                    alt="img_search"
                  />
                  <Tooltip
                    title="Clear image search"
                    placement="top"
                    arrow={true}
                  >
                    <button
                      type="button"
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
                          color: settings.theme?.primaryColor,
                        }}
                      />
                    </button>
                  </Tooltip>
                </Box>
              )}
            </Box>

            <input
              style={{
                border: '0px',
                width: '100%',
                fontSize: 14,
                color: '#2B2C46',
              }}
              className="input-search"
              placeholder={t('Search')}
              value={valueInput}
              onChange={onChangeText}
              ref={focusInp}
            />
          </Box>

          {history.location.pathname === '/result' && valueInput && (
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
              <Tooltip
                title={t('Clear text search')}
                placement="top"
                arrow={true}
              >
                <ClearOutlinedIcon style={{ fontSize: 16, color: '#2B2C46' }} />
              </Tooltip>
            </Button>
          )}
          {!isMobile ? (
            <div className="wrap-box-input-mobile d-flex">
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
              <Tooltip
                title={t('Search with an image')}
                placement="top"
                arrow={true}
              >
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
                    }}
                  >
                    <img src={IconCamera} alt="" width={18} height={18} />
                  </IconButton>
                </label>
              </Tooltip>
            </div>
          ) : (
            <Box>
              <Button
                className="btn-mobile-filter"
                onClick={onToggleFilterMobile}
              >
                <IconFilter width={18} height={18} />
              </Button>
            </Box>
          )}
        </form>
      </div>
      {settings.preFilterOption && (
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
  );
};

const CustomSearchBox = connectSearchBox<any>(memo(SearchBox));
export default CustomSearchBox;
