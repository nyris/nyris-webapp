import { memo, useRef, useState } from 'react';

import cx from 'classnames';

import { RectCoords } from '@nyris/nyris-api';
import { Preview } from '@nyris/nyris-react-components';
import { DEFAULT_REGION } from '../constants';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { ReactComponent as PlusIcon } from 'common/assets/icons/plus.svg';
import { ReactComponent as CropIcon } from 'common/assets/icons/crop.svg';
import { ReactComponent as DownloadIcon } from 'common/assets/icons/download.svg';
import { ReactComponent as IconInfo } from 'common/assets/icons/info-tooltip.svg';

import { useQuery } from 'hooks/useQuery';
import {
  reset,
  setImageSearchInput,
  setSearchResults,
  updateStatusLoading,
} from 'Store/search/Search';
import { useHistory } from 'react-router-dom';
import { createImage, find } from 'services/image';
import { isEmpty } from 'lodash';
import useRequestStore from 'Store/requestStore';
import CameraCustom from './drawer/cameraCustom';
import useFilteredRegions from 'hooks/useFilteredRegions';
import useResultStore from 'Store/resultStore';
import { useDropzone } from 'react-dropzone';
import { useImageSearch } from 'hooks/useImageSearch';

function ImagePreviewMobileComponent({
  requestImage,
  imageSelection,
  debouncedOnImageSelectionChange,
  showAdjustInfo,
  showAdjustInfoBasedOnConfidence,
  isExpanded,
  isCameraUploadEnabled = true,
  ...rest
}: {
  requestImage?: any;
  imageSelection?: any;
  filteredRegions?: any;
  debouncedOnImageSelectionChange: any;
  showAdjustInfoBasedOnConfidence: any;
  showAdjustInfo: any;
  isCameraUploadEnabled?: boolean;
  isExpanded?: boolean;
}) {
  const { t } = useTranslation();
  const settings = useAppSelector(state => state.settings);
  const { preFilter } = useAppSelector(state => state.search);
  const isAlgoliaEnabled = settings.algolia?.enabled;
  const query = useQuery();
  const dispatch = useAppDispatch();
  const history = useHistory();

  const { requestImages, addRequestImage, regions } = useRequestStore(
    state => ({
      requestImages: state.requestImages,
      regions: state.regions,
      addRequestImage: state.addRequestImage,
    }),
  );

  const { detectedObject } = useResultStore(state => ({
    detectedObject: state.detectedObject,
  }));

  const { multiImageSearch } = useImageSearch();

  const [showCamera, setShowCamera] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(requestImages.length - 1);
  const [isVisible, setIsVisible] = useState(isExpanded);

  const previewWrapperRef = useRef<any>(null);

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
      if (searchQuery || requestImages.length > 0) {
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
  };

  const filteredRegions = useFilteredRegions(
    detectedObject[currentIndex],
    regions[currentIndex],
  );

  const { getInputProps } = useDropzone({
    onDrop: async (fs: File[]) => {
      if (!fs[0]) return;

      dispatch(setImageSearchInput(URL.createObjectURL(fs[0])));
      let image = await createImage(fs[0]);

      multiImageSearch({
        images: [...requestImages, image],
        regions: regions,
        settings,
      });
      addRequestImage(image);
    },
  });

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
          'desktop:px-5',
          'relative',
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
            regions={filteredRegions || []}
            dotColor={'#FBD914'}
            minCropWidth={30}
            minCropHeight={30}
            rounded={true}
          />
        </div>
        <div className="max-w-[300px] max-h-[300px]"></div>
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
              bottom: 125,
              borderRadius: '16px',
              zIndex: 1000,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              height: 'fit-content',
            }}
          >
            <IconInfo color="white" />
            <p
              style={{
                fontSize: 10,
                color: '#fff',
              }}
            >
              {showAdjustInfo
                ? t('Crop the image for better results')
                : 'Crop the image for better results'}
            </p>
          </div>
        )}
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
            'desktop:pt-7 desktop:pb-5',
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
                    'desktop:w-[52px]',
                    'desktop:h-[52px]',
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
                      'desktop:w-[52px]',
                      'desktop:h-[52px]',
                      'rounded-md',
                      'top-1',
                      'bg-black/15',
                    ])}
                    onClick={() => {
                      setCurrentIndex(index);
                      if (!isVisible) {
                        handleExpand();
                      }
                    }}
                  />
                )}
              </div>
            );
          })}
          {requestImages.length < 3 && (
            <button
              className={cx([
                'w-[70px]',
                'h-[70px]',
                'desktop:w-[52px]',
                'desktop:h-[52px]',
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
                if (isCameraUploadEnabled) {
                  setShowCamera(true);
                }
              }}
            >
              <input
                accept="image/*"
                id="icon-add-image"
                type="file"
                style={{ display: 'none' }}
                {...getInputProps({
                  onClick: e => {
                    e.currentTarget.value = '';
                    e.stopPropagation();
                  },
                })}
              />
              <PlusIcon className={cx(['text-[#AAABB5] desktop:hidden'])} />
              <label htmlFor="icon-add-image" className="hidden desktop:block">
                <DownloadIcon className={cx(['text-[#AAABB5]'])} />
              </label>
            </button>
          )}

          <div
            className="absolute right-5 rounded-full bg-white w-6 h-6 flex justify-center items-center desktop:hidden"
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
const ImagePreview = memo(ImagePreviewMobileComponent);
export default ImagePreview;
