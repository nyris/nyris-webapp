// @ts-nocheck
import React, { memo, useState } from 'react';
import { Typography, Hidden } from '@material-ui/core';
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
import { find } from 'services/image';
import { isEmpty } from 'lodash';

function ImagePreviewMobileComponent({
  requestImage,
  imageSelection,
  debouncedOnImageSelectionChange,
  filteredRegions,
  showAdjustInfo,
  showAdjustInfoBasedOnConfidence,
  ...rest
}: {
  requestImage: any;
  imageSelection: any;

  debouncedOnImageSelectionChange: any;
  filteredRegions: any;
  showAdjustInfoBasedOnConfidence: any;
  showAdjustInfo: any;
}) {
  const { t } = useTranslation();
  const [editActive, setEditActive] = useState(false);
  const settings = useAppSelector(state => state.settings);
  const { preFilter } = useAppSelector(state => state.search);
  const isAlgoliaEnabled = settings.algolia?.enabled;
  const query = useQuery();
  const dispatch = useAppDispatch();
  const history = useHistory();

  const handleArrowClick = () => {
    setEditActive(s => !s);
  };

  const searchQuery = query.get('query') || '';

  const onImageRemove = () => {
    if (!searchQuery) {
      dispatch(reset(''));
      history.push('/');
    }
    dispatch(reset(''));

    if (!isAlgoliaEnabled) {
      let payload: any;
      let filters: any[] = [];
      const preFilterValues = [
        {
          key: settings.visualSearchFilterKey,
          values: Object.keys(preFilter),
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
            res?.results.forEach((item: any) => {
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
    <div
      className="col-left"
      style={{
        backgroundColor: '#5D5D63',
        marginBottom: '15px',
      }}
    >
      <div>
        <div className="box-preview">
          <div>
            <div
              className="preview-item"
              style={{
                backgroundColor: 'transparent',
              }}
            >
              <Preview
                key={requestImage?.id}
                onSelectionChange={(r: RectCoords) => {
                  debouncedOnImageSelectionChange(r);
                }}
                image={requestImage?.canvas}
                selection={imageSelection || DEFAULT_REGION}
                regions={filteredRegions}
                minWidth={
                  Math.min(80 * (requestImage?.canvas?.width / requestImage?.canvas?.height), 200)
                }
                minHeight={80}
                maxWidth={255}
                maxHeight={255}
                dotColor={editActive ? '#FBD914' : ''}
                minCropWidth={editActive ? 30 : 5}
                minCropHeight={editActive ? 30 : 5}
                rounded={false}
                expandAnimation={editActive}
                shrinkAnimation={!editActive}
                onExpand={() => {
                  setEditActive(true);
                }}
                showGrip={editActive}
                draggable={editActive ? true : false}
              />
            </div>
          </div>

          {(showAdjustInfoBasedOnConfidence || showAdjustInfo) && (
            <div
              style={{
                backgroundColor: '#3E36DC',
                display: 'flex',
                columnGap: '6px',
                padding: '5px',
                width: 'fit-content',
                minWidth: '180px',
                marginTop: 'auto',
                position: 'absolute',
                bottom: -25,
                borderRadius: '16px',
                zIndex: 1000,
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
            </div>
          )}
        </div>
        <>
          <Hidden>
            <div
              style={{
                position: 'absolute',
                left: '15px',
                top: '25px',
                padding: '4px',
              }}
              onClick={onImageRemove}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                  borderRadius: '100%',
                }}
              >
                <Trash color="white" fill="white" />
              </div>
            </div>
          </Hidden>

          <Hidden mdUp>
            <div
              className="slideDown"
              style={{
                position: 'absolute',
                bottom: '25px',
                right: '20px',
              }}
              onClick={handleArrowClick}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  display: 'flex',
                  borderRadius: '100%',
                  backgroundColor: 'white',
                }}
              >
                {editActive && <ArrowUp color="black" />}
                {!editActive && <ArrowDown color="black" fill="black" />}
              </div>
            </div>
          </Hidden>
        </>
      </div>
    </div>
  );
}
const ImagePreviewMobile = memo(ImagePreviewMobileComponent);
export default ImagePreviewMobile;
