import React from 'react';
import { useCallback, useRef, useState } from 'react';

import { debounce } from 'lodash';

import { RectCoords } from '@nyris/nyris-api';
import { Icon, Preview } from '@nyris/nyris-react-components';
import { useTranslation } from 'react-i18next';

import { useImageSearch } from 'hooks/useImageSearch';
import useRequestStore from 'stores/request/requestStore';
import { twMerge } from 'tailwind-merge';
import { DEFAULT_REGION } from '../constants';

function ImagePreviewComponent({
  showAdjustInfo = false,
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
  const settings = window.settings;
  const isMultiImageSearchEnabled = settings.multiImageSearch;

  const requestImages = useRequestStore(state => state.requestImages);

  const { singleImageSearch } = useImageSearch();

  const [showCamera, setShowCamera] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(requestImages.length - 1);
  const [isVisible, setIsVisible] = useState(true);
  const [zIndex, setZIndex] = useState<number>(0);

  const previewWrapperRef = useRef<any>(null);

  const onImageRemove = () => {};

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const findItemsInSelection = useCallback(
    debounce(async (r: RectCoords, image: HTMLCanvasElement) => {
      singleImageSearch({
        image: image,
        settings,
        imageRegion: r,
        showFeedback: true,
        compress: false,
      }).then((res: any) => {
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
    [settings, singleImageSearch],
  );

  const multiImageSearchOnRegionChange = useCallback(() => {}, [
    requestImages,
    settings,
  ]);

  // eslint-disable-next-line react-hooks/exhaustive-deps

  const [editActive, setEditActive] = useState(false);
  return (
    <>
      {/* Image preview Desktop, To-do: Remove and use same code as Image preview for Mobile */}
      <div
        ref={previewWrapperRef}
        className={twMerge([
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
              // debouncedOnImageSelectionChange(r, currentIndex);
            }}
            image={requestImages[currentIndex]}
            selection={DEFAULT_REGION}
            regions={[]}
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
        className={twMerge([
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
          {/* <Preview
            onSelectionChange={(r: RectCoords) => {
              debouncedOnImageSelectionChange(r, currentIndex);
            }}
            image={requestImages[currentIndex]}
            selection={regions[currentIndex] || DEFAULT_REGION}
            regions={[]}
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
          /> */}
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

      <div className={twMerge([!isMultiImageSearchEnabled && 'hidden'])}>
        <div
          className={twMerge([
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
                className={twMerge([
                  'rounded-md',
                  'relative',
                  'p-1',
                  currentIndex === index && isVisible
                    ? ' bg-white'
                    : 'bg-transparent',
                ])}
              >
                <img
                  className={twMerge([
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
                    className={twMerge([
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
              className={twMerge([
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
                // {...getInputProps({
                //   onClick: e => {
                //     e.currentTarget.value = '';
                //     e.stopPropagation();
                //   },
                // })}
              />
              <Icon
                name="plus"
                className={twMerge(['text-[#AAABB5] desktop:hidden'])}
              />
              <div className="hidden desktop:block">
                <Icon name="download" className={twMerge(['text-[#AAABB5]'])} />
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

          {/* <CameraCustom
            show={showCamera}
            onClose={() => setShowCamera(false)}
          /> */}
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
