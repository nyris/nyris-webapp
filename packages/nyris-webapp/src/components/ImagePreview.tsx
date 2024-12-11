import { useCallback, useRef, useState } from 'react';

import cx from 'classnames';

import { RectCoords } from '@nyris/nyris-api';
import { Icon, Preview } from '@nyris/nyris-react-components';
import { DEFAULT_REGION } from '../constants';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'Store/Store';

import { useQuery } from 'hooks/useQuery';
import {
  loadingActionResults,
  reset,
  setSearchResults,
  updateResultChangePosition,
  updateStatusLoading,
} from 'Store/search/Search';
import { useHistory } from 'react-router-dom';
import { createImage, find } from 'services/image';
import { debounce, isEmpty, isUndefined } from 'lodash';
import useRequestStore from 'Store/requestStore';
import CameraCustom from './drawer/cameraCustom';
import useFilteredRegions from 'hooks/useFilteredRegions';
import useResultStore from 'Store/resultStore';
import { useDropzone } from 'react-dropzone';
import { useImageSearch } from 'hooks/useImageSearch';
import { compressImage } from 'utils';
import React from 'react';

function ImagePreviewComponent({
  showAdjustInfo = false,
  isExpanded,
  isCameraUploadEnabled = true,
}: {
  imageSelection?: any;
  filteredRegions?: any;
  showAdjustInfo?: any;
  isCameraUploadEnabled?: boolean;
  isExpanded?: boolean;
}) {
  const [showAdjustInfoBasedOnConfidence, setShowAdjustInfoBasedOnConfidence] =
    useState(false);

  const { t } = useTranslation();
  const settings = useAppSelector(state => state.settings);
  const preFilter = useAppSelector(state => state.search.preFilter);
  const isAlgoliaEnabled = settings.algolia?.enabled;
  const isMultiImageSearchEnabled = settings.multiImageSearch;

  const query = useQuery();
  const dispatch = useAppDispatch();
  const history = useHistory();

  const {
    setRequestImages,
    resetRegions,
    requestImages,
    addRequestImage,
    regions,
    updateRegion,
    imageRegions,
  } = useRequestStore(state => ({
    requestImages: state.requestImages,
    regions: state.regions,
    addRequestImage: state.addRequestImage,
    updateRegion: state.updateRegion,
    imageRegions: state.regions,
    resetRegions: state.resetRegions,
    setRequestImages: state.setRequestImages,
  }));

  const { detectedObject } = useResultStore(state => ({
    detectedObject: state.detectedObject,
  }));

  const { multiImageSearch, singleImageSearch } = useImageSearch();

  const [showCamera, setShowCamera] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(requestImages.length - 1);
  const [isVisible, setIsVisible] = useState(true);
  const [zIndex, setZIndex] = useState<number>(0);

  const previewWrapperRef = useRef<any>(null);

  const searchQuery = query.get('query') || '';

  const onImageRemove = () => {
    dispatch(reset(''));
    resetRegions();
    setRequestImages([]);
    if (!searchQuery) {
      history.push('/');
    }

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
            dispatch(updateStatusLoading(false));
          });
      } else {
        dispatch(setSearchResults([]));
      }
    }
  };

  const handleExpand = () => {
    if (isVisible) {
      setTimeout(() => {
        setZIndex(-1);
      }, 300);
    } else {
      setZIndex(0);
    }
    setIsVisible(s => !s);
  };

  const filteredRegions = useFilteredRegions(
    detectedObject[currentIndex],
    regions[currentIndex],
  );

  const { getInputProps } = useDropzone({
    onDrop: async (fs: File[]) => {
      if (!fs[0]) return;

      dispatch(updateStatusLoading(true));
      dispatch(loadingActionResults());

      const compressedBase64 = await compressImage(fs[0]);
      let image = await createImage(compressedBase64);

      multiImageSearch({
        images: [...requestImages, image],
        regions: regions,
        settings,
      }).then(() => {
        dispatch(updateStatusLoading(false));
      });
      addRequestImage(image);
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const findItemsInSelection = useCallback(
    debounce(async (r: RectCoords, image: HTMLCanvasElement) => {
      dispatch(updateStatusLoading(true));
      singleImageSearch({
        image: image,
        settings,
        imageRegion: r,
        showFeedback: true,
        compress: false,
      }).then((res: any) => {
        dispatch(updateStatusLoading(false));

        dispatch(updateResultChangePosition(res));
        const highConfidence = res.results.find(
          (data: { score: number }) => data.score >= 0.65,
        );
        if (!highConfidence) {
          setShowAdjustInfoBasedOnConfidence(true);
        }
        setTimeout(() => {
          setShowAdjustInfoBasedOnConfidence(false);
        }, 2000);
      });
      return;
    }, 250),
    [dispatch, settings, singleImageSearch],
  );

  const multiImageSearchOnRegionChange = useCallback(
    (r: RectCoords, index: number) => {
      dispatch(updateStatusLoading(true));
      dispatch(loadingActionResults());
      let modifiedRegions = [...imageRegions];
      modifiedRegions[index] = r;
      multiImageSearch({
        images: requestImages,
        regions: modifiedRegions,
        settings,
      }).then(() => {
        dispatch(updateStatusLoading(false));
      });
    },
    [dispatch, imageRegions, multiImageSearch, requestImages, settings],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnImageSelectionChange = useCallback(
    debounce((r: RectCoords, index?: number) => {
      if (requestImages.length > 1 && !isUndefined(index)) {
        updateRegion(r, index);
        multiImageSearchOnRegionChange(r, index);
      } else {
        updateRegion(r, 0);
        findItemsInSelection(r, requestImages[0]);
      }
    }, 50),
    [
      findItemsInSelection,
      multiImageSearchOnRegionChange,
      requestImages,
      updateRegion,
    ],
  );

  const [editActive, setEditActive] = useState(false);
  return (
    <>
      {/* Image preview Desktop, To-do: Remove and use same code as Image preview for Mobile */}
      <div
        ref={previewWrapperRef}
        className={cx([
          'bg-primary',
          'justify-center',
          isVisible ? (!isMultiImageSearchEnabled ? 'py-5' : 'pt-6') : '',
          'px-7',
          'w-full',
          'desktop:px-5',
          'relative',
          'hidden',
          'desktop:flex',
        ])}
        // style={{
        //   height: '100%',
        //   maxHeight: isVisible ? '800px' : 0,
        //   overflow: 'hidden',
        //   zIndex: zIndex,
        // }}
        style={{
          // transform: isVisible ? 'translateY(0)' : `translateY(-100%)`,
          // opacity: isVisible ? 1 : 0,
          marginTop: isVisible ? '0px' : 'calc(-100% + 30px)',
          transition: isVisible ? 'margin-top 0.4s linear' : '',
          zIndex: zIndex,
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
        {(showAdjustInfoBasedOnConfidence || showAdjustInfo) && (
          <div
            style={{
              backgroundColor: '#3E36DC',
              display: 'flex',
              columnGap: '6px',
              padding: '5px',
              width: 'fit-content',
              marginTop: 'auto',
              position: 'absolute',
              bottom: -20,
              borderRadius: '16px',
              zIndex: 1000,
              height: 'fit-content',
            }}
          >
            <Icon name="info" color="white" width={12} height={12} />
            <p
              style={{
                fontSize: 12,
                color: '#fff',
                paddingRight: '4px',
              }}
            >
              {showAdjustInfo
                ? t('Crop the image for better results')
                : 'Crop the image for better results'}
            </p>
          </div>
        )}
        <div
          onClick={() => onImageRemove()}
          className={`absolute left-2 top-2 flex justify-center items-center cursor-pointer`}
        >
          <div className="rounded-full bg-white/50 hover:bg-white w-6 h-6 flex justify-center items-center">
            <Icon
              name="trash"
              className="text-primary"
              width={14}
              height={14}
            />
          </div>
        </div>
      </div>
      {/* Image preview Mobile*/}
      <div
        className={cx([
          'bg-primary',
          'justify-center',
          'p-5',
          !editActive ? 'py-2' : '',
          'w-full',
          'relative',
          'flex',
          'desktop:hidden',
        ])}
      >
        <div
          className={`w-full ${
            editActive ? 'bg-[#55566b] ' : ''
          } flex just items-center`}
        >
          <Preview
            onSelectionChange={(r: RectCoords) => {
              debouncedOnImageSelectionChange(r, currentIndex);
            }}
            image={requestImages[currentIndex]}
            selection={regions[currentIndex] || DEFAULT_REGION}
            regions={filteredRegions || []}
            minWidth={Math.min(
              80 *
                (requestImages[currentIndex]?.width /
                  requestImages[currentIndex]?.height),
              200,
            )}
            minHeight={80}
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
        {(showAdjustInfoBasedOnConfidence || showAdjustInfo) && (
          <div
            style={{
              backgroundColor: '#3E36DC',
              display: 'flex',
              columnGap: '6px',
              padding: '5px',
              width: 'fit-content',
              marginTop: 'auto',
              position: 'absolute',
              bottom: -16,
              borderRadius: '16px',
              zIndex: 1000,
              height: 'fit-content',
              alignItems: 'center',
            }}
          >
            <Icon name="info" color="white" width={12} height={12} />
            <p
              style={{
                fontSize: 12,
                color: '#fff',
                paddingRight: '4px',
              }}
            >
              {showAdjustInfo
                ? t('Crop the image for better results')
                : 'Crop the image for better results'}
            </p>
          </div>
        )}
        <div
          onClick={() => setEditActive(s => !s)}
          className={`absolute right-1 ${
            editActive ? 'bottom-1' : 'bottom-8'
          } flex justify-center items-center desktop:hidden p-1`}
        >
          <div className="rounded-full bg-white w-6 h-6 flex justify-center items-center desktop:hidden">
            {editActive && <Icon name="collapse" className="text-primary" />}
            {!editActive && <Icon name="crop" className="text-primary" />}
          </div>
        </div>

        <div
          onClick={() => onImageRemove()}
          className={`absolute left-1 ${
            editActive ? 'top-1' : 'top-8'
          } flex justify-center items-center desktop:hidden p-1`}
        >
          <div className="rounded-full bg-white w-6 h-6 flex justify-center items-center desktop:hidden">
            <Icon
              name="trash"
              className="text-primary"
              width={14}
              height={14}
            />
          </div>
        </div>
      </div>

      <div className={cx([!isMultiImageSearchEnabled && 'hidden'])}>
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
                  src={(() => {
                    if (image?.toDataURL) {
                      return image.toDataURL();
                    }
                  })()}
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
          {requestImages.length < 3 && isMultiImageSearchEnabled && (
            <label
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
                'cursor-pointer',
              ])}
              onClick={() => {
                if (isCameraUploadEnabled) {
                  setShowCamera(true);
                }
              }}
              htmlFor={isCameraUploadEnabled ? '' : 'icon-add-image'}
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
              <Icon
                name="plus"
                className={cx(['text-[#AAABB5] desktop:hidden'])}
              />
              <div className="hidden desktop:block">
                <Icon name="download" className={cx(['text-[#AAABB5]'])} />
              </div>
            </label>
          )}
          <div
            onClick={() => handleExpand()}
            className="absolute right-5 flex justify-center items-center desktop:hidden p-2"
          >
            <div className="rounded-full bg-white w-6 h-6 flex justify-center items-center desktop:hidden">
              <Icon name="crop" className="text-primary" />
            </div>
          </div>

          <CameraCustom
            show={showCamera}
            onClose={() => setShowCamera(false)}
          />
        </div>
        {requestImages.length < 3 && isMultiImageSearchEnabled && (
          <p className="text-[10px] pb-4 w-full text-center bg-primary text-white -mt-[1px]">
            Add up to three photos for a more accurate visual search.
          </p>
        )}
      </div>
    </>
  );
}
const ImagePreview = React.memo(ImagePreviewComponent);
export default ImagePreview;
