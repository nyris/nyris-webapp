// // @ts-nocheck

import React, { memo, useEffect, useRef, useState } from 'react';

import cx from 'classnames';

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
import { ReactComponent as PlusIcon } from 'common/assets/icons/plus.svg';
import { ReactComponent as CropIcon } from 'common/assets/icons/crop.svg';

import { useQuery } from 'hooks/useQuery';
import {
  reset,
  setSearchResults,
  updateStatusLoading,
} from 'Store/search/Search';
import { useHistory } from 'react-router-dom';
import { find } from 'services/image';
import { isEmpty } from 'lodash';
import useRequestStore from 'Store/requestStore';
import CameraCustom from './drawer/cameraCustom';

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
  const settings = useAppSelector(state => state.settings);
  const { preFilter } = useAppSelector(state => state.search);
  const isAlgoliaEnabled = settings.algolia?.enabled;
  const query = useQuery();
  const dispatch = useAppDispatch();
  const history = useHistory();

  const { requestImages, regions } = useRequestStore(state => ({
    requestImages: state.requestImages,
    regions: state.regions,
  }));

  const [editActive, setEditActive] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(requestImages.length - 1);
  const [isVisible, setIsVisible] = useState(false);
  const [translateValue, setTranslateValue] = useState(0);
  const [isAbsolute, setIsAbsolute] = useState(false);

  const previewWrapperRef = useRef<any>(null);

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

  const handleExpand = () => {
    setIsVisible(s => !s);

    // Change to absolute after the transition
    setTimeout(() => {
      setIsAbsolute(s => !s);
    }, 500); // Match the duration of the transition
  };

  useEffect(() => {
    if (previewWrapperRef.current) {
      // Set translate value to the height of divA
      setTranslateValue(previewWrapperRef.current.clientHeight);
    }
  }, []);

  return (
    <>
      <div
        ref={previewWrapperRef}
        className={cx([
          'bg-primary',
          'flex',
          'justify-center',
          isVisible ? 'pt-6' : '',
          'px-7',
          'w-full',
        ])}
        style={{
          opacity: isVisible ? 1 : 0,
          height: isVisible ? '100%' : 0,
          transition: 'opacity 0.4s ease, height 0.2s ease',
        }}
      >
        <div className="w-full bg-[#55566b] aspect-square flex just items-center">
          <Preview
            onSelectionChange={(r: RectCoords) => {
              debouncedOnImageSelectionChange(r, currentIndex);
            }}
            image={requestImages[currentIndex]}
            selection={regions[currentIndex] || DEFAULT_REGION}
            regions={filteredRegions}
            dotColor={editActive ? '#FBD914' : ''}
            minCropWidth={30}
            minCropHeight={30}
            rounded={true}
          />
        </div>
        <div className="max-w-[300px] max-h-[300px]"></div>
      </div>
      <div
        style={{
          transform: isVisible ? 'translateY(0)' : `translateY(0%)`,
          transition: 'transform 0.3s ease',
        }}
      >
        <div
          className={cx([
            'flex',
            'items-center',
            'gap-x-2',
            'h-28',
            'w-full',
            'bg-primary',
            'justify-center',
            'relative',
            'py-4',
          ])}
        >
          {requestImages.map((image, index) => {
            return (
              <div
                key={index}
                className={cx([
                  'rounded-md',
                  'relative',
                  'p-1',
                  currentIndex === index && isVisible
                    ? ' bg-white'
                    : 'bg-transparent',
                ])}
              >
                <img
                  className={cx([
                    'w-[70px]',
                    'h-[70px]',
                    'rounded-md',
                    'object-cover',
                    'shadow-inner',
                  ])}
                  src={image.toDataURL()}
                  alt=""
                  onClick={() => {
                    setCurrentIndex(index);
                    if (!isVisible) {
                      handleExpand();
                    }
                  }}
                />
                {currentIndex === index && (
                  <div
                    className={cx([
                      'absolute',
                      'w-[70px]',
                      'h-[70px]',
                      'rounded-md',
                      'top-1',
                      'bg-black/15',
                    ])}
                  />
                )}
              </div>
            );
          })}
          {requestImages.length < 3 && (
            <div
              className={cx([
                'w-[70px]',
                'h-[70px]',
                'bg-[#55566B]/50',
                'flex',
                'justify-center',
                'items-center',
                'border',
                'border-dashed',
                'border-[#AAABB5]',
                'rounded-md',
              ])}
              onClick={() => {
                setShowCamera(true);
              }}
            >
              <PlusIcon className={cx(['text-[#AAABB5]'])} />
            </div>
          )}

          <div
            className="absolute right-5 rounded-full bg-white w-6 h-6 flex justify-center items-center"
            onClick={() => handleExpand()}
          >
            <CropIcon className="text-primary" />
          </div>

          <CameraCustom
            show={showCamera}
            onClose={() => setShowCamera(false)}
          />
        </div>
        {requestImages.length < 3 && (
          <p className="text-[10px] pb-4 w-full text-center bg-primary text-white -mt-[1px]">
            Add up to three photos for a more accurate visual search.
          </p>
        )}
      </div>
    </>
  );
}
const ImagePreviewMobile = memo(ImagePreviewMobileComponent);
export default ImagePreviewMobile;
