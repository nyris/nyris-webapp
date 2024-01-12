import React, { memo, useState } from 'react';
import { Box, Typography, Hidden } from '@material-ui/core';
import { RectCoords } from '@nyris/nyris-api';
import { Preview } from '@nyris/nyris-react-components';
import { DEFAULT_REGION } from '../constants';
import { ReactComponent as IconInfo } from 'common/assets/icons/info-tooltip.svg';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { ReactComponent as ArrowUp } from 'common/assets/icons/arrow_up.svg';
import { ReactComponent as ArrowDown } from 'common/assets/icons/arrow_down.svg';
import { ReactComponent as Trash } from 'common/assets/icons/trash.svg';
import { useQuery } from 'hooks/useQuery';
import {
  reset,
  setSearchResults,
  updateStatusLoading,
} from 'Store/search/Search';
import { useHistory } from 'react-router-dom';
import { connectSearchBox } from 'react-instantsearch-dom';
import { find } from 'services/image';
import { isEmpty } from 'lodash';

function ImagePreviewMobileComponent({
  requestImage,
  imageSelection,
  setImageSelection,
  debouncedOnImageSelectionChange,
  filteredRegions,
  showAdjustInfo,
  showAdjustInfoBasedOnConfidence,
  ...rest
}: {
  requestImage: any;
  imageSelection: any;
  setImageSelection: any;
  debouncedOnImageSelectionChange: any;
  filteredRegions: any;
  showAdjustInfoBasedOnConfidence: any;
  showAdjustInfo: any;
}) {
  const { t } = useTranslation();
  const { refine }: any = rest;
  const [editActive, setEditActive] = useState(false);
  const [showShrinkAnimation, setShrinkAnimation] = useState(false);
  const settings = useAppSelector(state => state.settings);
  const { preFilter } = useAppSelector(state => state.search);
  const isAlgoliaEnabled = settings.algolia?.enabled;
  const query = useQuery();
  const dispatch = useAppDispatch();
  const history = useHistory();

  const handleArrowClick = () => {
    setEditActive(s => !s);
    setShrinkAnimation(true);
  };

  const searchQuery = query.get('query') || '';

  const onImageRemove = () => {
    if (!searchQuery) {
      dispatch(reset(''));
      history.push('/');
    }
    dispatch(reset(''));
    if (isAlgoliaEnabled) {
      // not an ideal solution: fixes text search not working after removing image
      setTimeout(() => {
        refine(searchQuery);
      }, 100);
    }
    if (!isAlgoliaEnabled) {
      let payload: any;
      let filters: any[] = [];
      const preFilterValues = [
        {
          key: settings.visualSearchFilterKey,
          values: Object.keys(preFilter) as string[],
        },
      ];
      if (searchQuery || requestImage) {
        dispatch(updateStatusLoading(true));
        find({
          settings,
          filters: !isEmpty(preFilter) ? preFilterValues : undefined,
          text: searchQuery,
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
      } else {
        dispatch(setSearchResults([]));
      }
    }
  };

  return (
    <Box
      className="col-left"
      style={{
        backgroundColor: '#5D5D63',
        marginBottom: '15px',
      }}
    >
      <div>
        <Box className="box-preview">
          <Box>
            <div
              className="preview-item"
              style={{
                backgroundColor: 'transparent',
              }}
            >
              <Preview
                key={requestImage?.id}
                onSelectionChange={(r: RectCoords) => {
                  setImageSelection(r);
                  debouncedOnImageSelectionChange(r);
                }}
                image={requestImage?.canvas}
                selection={imageSelection || DEFAULT_REGION}
                regions={filteredRegions}
                minWidth={80}
                minHeight={80}
                maxWidth={255}
                maxHeight={255}
                dotColor={editActive ? '#FBD914' : ''}
                minCropWidth={editActive ? 60 : 5}
                minCropHeight={editActive ? 60 : 5}
                rounded={false}
                expandAnimation={editActive}
                shrinkAnimation={!editActive}
                onExpand={() => {
                  setEditActive(true);
                }}
                showGrip={editActive}
              />
            </div>
          </Box>
          {(showAdjustInfoBasedOnConfidence || showAdjustInfo) && (
            <Box
              className="box-title_col-left"
              alignItems="center"
              style={{
                backgroundColor: '#3E36DC',
                display: 'flex',
                columnGap: '6px',
                padding: '5px',
                width: 'fit-content',
                minWidth: '180px',
              }}
            >
              <IconInfo color="white" />
              <Typography
                style={{
                  fontSize: 10,
                  color: '#fff',
                }}
              >
                {showAdjustInfo
                  ? t('Crop the image for better results')
                  : 'Crop the image for better results'}
              </Typography>
            </Box>
          )}
        </Box>
        <>
          <Hidden>
            <Box
              sx={{
                position: 'absolute',
                left: '15px',
                top: '25px',
                padding: '4px',
              }}
              onClick={onImageRemove}
            >
              <Box
                sx={{
                  width: '24px',
                  height: '24px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                  borderRadius: '100%',
                }}
              >
                <Trash color="white" fill="white" />
              </Box>
            </Box>
          </Hidden>

          <Hidden mdUp>
            <Box
              className="slideDown"
              sx={{
                position: 'absolute',
                bottom: '25px',
                right: '20px',
              }}
              onClick={handleArrowClick}
            >
              <Box
                bgcolor={'white'}
                sx={{
                  width: '24px',
                  height: '24px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                  borderRadius: '100%',
                }}
              >
                {editActive && <ArrowUp color="black" />}
                {!editActive && <ArrowDown color="black" fill="black" />}
              </Box>
            </Box>
          </Hidden>
        </>
      </div>
    </Box>
  );
}
const ImagePreviewMobile = connectSearchBox<any>(
  memo(ImagePreviewMobileComponent),
);
export default ImagePreviewMobile;
