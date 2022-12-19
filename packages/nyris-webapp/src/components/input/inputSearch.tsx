import { Box, Button } from '@material-ui/core';
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
} from 'Store/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';

const SearchBox = (props: any) => {
  const { refine, onToggleFilterMobile }: any = props;
  // const containerRefInputMobile = useRef<HTMLDivElement>(null);
  const stateGlobal = useAppSelector(state => state);
  const { search, settings } = stateGlobal;
  const { imageThumbSearchInput } = search;
  const focusInp: any = useRef<HTMLDivElement | null>(null);
  const history = useHistory();
  const [valueInput, setValueInput] = useState<string>('');
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const query = useQuery();

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
      return findByImage(image, settings)
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

  return (
    <Box className="wrap-input-search">
      <div style={{ padding: 10 }} className="box-input-search d-flex">
        <form noValidate action="" role="search">
          <Box className="box-inp">
            <Box
              style={
                imageThumbSearchInput
                  ? { paddingLeft: 0, height: '100%' }
                  : { paddingLeft: 10, height: '100%' }
              }
            >
              {imageThumbSearchInput && (
                <Box className="box-image-search-thumb" display={'flex'}>
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
                    <CloseIcon style={{ fontSize: 20, color: '#3e36dc' }} />
                  </button>
                </Box>
              )}
            </Box>

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
              onChange={event => {
                setValueInput(event.currentTarget.value);
                // debounceSearch(event.currentTarget.value);
                searchOrRedirect(event.currentTarget.value);
              }}
              ref={focusInp}
            />
            {!imageThumbSearchInput && (
              <Box className="icon-search">
                <img src={IconSearch} alt="" width={24} height={24} />
              </Box>
            )}
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
            <div className="wrap-box-input-mobile">
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
    </Box>
  );
};

const CustomSearchBox = connectSearchBox<any>(memo(SearchBox));
export default CustomSearchBox;
