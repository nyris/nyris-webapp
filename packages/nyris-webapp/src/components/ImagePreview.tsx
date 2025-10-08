import React, { useCallback, useRef, useState } from 'react';

import { debounce } from 'lodash';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { Icon, Preview } from '@nyris/nyris-react-components';
import { RectCoords } from '@nyris/nyris-api';

import { DEFAULT_REGION } from '../constants';
import { useImageSearch } from 'hooks/useImageSearch';
import useRequestStore from 'stores/request/requestStore';
import useResultStore from 'stores/result/resultStore';

function ImagePreviewComponent({
  showAdjustInfo = false,
}: {
  imageSelection?: any;
  filteredRegions?: any;
  showAdjustInfo?: any;
  isExpanded?: boolean;
}) {
  const [showAdjustInfoBasedOnConfidence, setShowAdjustInfoBasedOnConfidence] =
    useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const settings = window.settings;
  const isMultiImageSearchEnabled = settings.multiImageSearch;

  const requestImages = useRequestStore(state => state.requestImages);
  const resetRegions = useRequestStore(state => state.resetRegions);
  const setRequestImages = useRequestStore(state => state.setRequestImages);
  const regions = useRequestStore(state => state.regions);
  const updateRegion = useRequestStore(state => state.updateRegion);
  const resetRequestStore = useRequestStore(state => state.reset);
  const setSpecifications = useRequestStore(state => state.setSpecifications);

  const detectedRegions = useResultStore(state => state.detectedRegions);
  const resetResultStore = useResultStore(state => state.reset);

  const { singleImageSearch } = useImageSearch();

  const currentIndex = requestImages.length - 1;

  const [isVisible] = useState(true);
  const [zIndex] = useState<number>(0);

  const previewWrapperRef = useRef<any>(null);

  const onImageRemove = () => {
    resetRegions();
    setRequestImages([]);

    navigate('/');
    resetResultStore();
    resetRequestStore();
    setSpecifications(null);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const findItemsInSelection = useCallback(
    debounce(async (r: RectCoords, image: HTMLCanvasElement) => {
      updateRegion(r, 0);

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
    }, 1500),
    [settings, singleImageSearch],
  );

  const [editActive, setEditActive] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnImageSelectionChange = useCallback(
    debounce((r: RectCoords, index?: number) => {
      findItemsInSelection(r, requestImages[0]);
    }, 0),
    [findItemsInSelection, requestImages, updateRegion],
  );

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
          // 'rounded',
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
        <div
          className={twMerge([
            // 'w-[243px]',
            'w-full',
            'bg-[#55566b] aspect-square flex just items-center',
          ])}
        >
          <Preview
            onSelectionChange={(r: RectCoords) => {
              debouncedOnImageSelectionChange(r, currentIndex);
            }}
            image={requestImages[currentIndex]}
            selection={regions[currentIndex] || DEFAULT_REGION}
            regions={detectedRegions[currentIndex] || []}
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
                : t('Adjust the selection frame for better results')}
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
          <Preview
            onSelectionChange={(r: RectCoords) => {
              debouncedOnImageSelectionChange(r, currentIndex);
            }}
            image={requestImages[currentIndex]}
            selection={regions[currentIndex] || DEFAULT_REGION}
            regions={detectedRegions[currentIndex] || []}
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
                : t('Adjust the selection frame for better results')}
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
    </>
  );
}
const ImagePreview = React.memo(ImagePreviewComponent);
export default ImagePreview;
