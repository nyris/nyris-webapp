// @ts-nocheck

import cx from 'classnames';

import { Drawer } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { RectCoords } from '@nyris/nyris-api';
import { isEmpty } from 'lodash';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Webcam from 'react-webcam';
import { createImage } from 'services/image';
import {
  onToggleModalItemDetail,
  setImageSearchInput,
  setRequestImage,
  setSearchResults,
  updateStatusLoading,
  loadingActionResults,
  setRegions,
  setSelectedRegion,
  setShowFeedback,
  setFirstSearchResults,
  setFirstSearchImage,
  setFirstSearchPrefilters,
  setFirstSearchThumbSearchInput,
  setImageCaptureHelpModal,
} from 'Store/search/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';

import { ReactComponent as IconInfo } from 'common/assets/icons/info-tooltip.svg';
import { ReactComponent as CloseIcon } from 'common/assets/icons/close.svg';
import { ReactComponent as GalleryIcon } from 'common/assets/icons/gallery.svg';
import { ReactComponent as NextArrowIcon } from 'common/assets/icons/next-arrow.svg';

import useRequestStore from 'Store/requestStore';
import { useImageSearch } from 'hooks/useImageSearch';

interface Props {
  show: boolean;
  onClose: any;
  newSearch?: boolean;
}

const FACING_MODE_USER = 'environment';
const FACING_MODE_ENVIRONMENT = 'user';

function CameraCustom(props: Props) {
  const { show: isToggle, onClose: onToggleModal, newSearch } = props;
  const webcamRef: any = useRef(null);
  const [facingMode, setFacingMode] = useState(FACING_MODE_USER);
  const [scaleCamera, setScaleCamera] = useState<number>(1);
  const stateGlobal = useAppSelector(state => state);
  const { search, settings } = stateGlobal;
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { preFilter, imageCaptureHelpModal } = search;

  const { singleImageSearch } = useImageSearch();

  const { requestImages, setRequestImages } = useRequestStore(state => ({
    requestImages: state.requestImages,
    setRequestImages: state.setRequestImages,
  }));

  const [capturedImages, setCapturedImages] = useState<HTMLCanvasElement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const multiImageUpload = requestImages.length > 0 && !newSearch;
  const canMultiImageSearch = capturedImages.length !== requestImages.length;

  const videoConstraints = {
    width: 1080,
    aspectRatio: 1.11111,
  };

  const addCapturedImage = async (image: any) => {
    let imageConvert = await createImage(image);
    setCapturedImages(state => [...state, imageConvert]);
  };

  const handleMultiImageSearch = () => {
    setRequestImages(capturedImages);
    handleClose();
  };

  const handlerFindImage = async (image: any) => {
    dispatch(updateStatusLoading(true));
    dispatch(loadingActionResults());
    if (history.location.pathname !== '/result') {
      history.push('/result');
    }
    let imageConvert = await createImage(image);

    singleImageSearch({ image: imageConvert, settings }).then(() => {
      dispatch(updateStatusLoading(false));
    });

    dispatch(onToggleModalItemDetail(false));
    handleClose();
  };

  const handleClose = () => {
    onToggleModal();
  };

  useEffect(() => {
    if (newSearch) {
      setCapturedImages([]);
      setCurrentIndex(0);
    } else {
      setCapturedImages([...requestImages]);
      setCurrentIndex(requestImages.length);
    }
  }, [requestImages, newSearch, isToggle]);

  return (
    <div className="box-camera-custom">
      <Drawer
        anchor={'bottom'}
        open={isToggle}
        onClose={() => handleClose()}
        className="modal-togggle-cam !bg-[#2B2C46]"
      >
        <div className="min-h-[60px] bg-[#2B2C46] flex justify-end">
          <div
            className="h-[60px] w-[60px] flex justify-center items-center"
            onClick={() => {
              dispatch(setImageCaptureHelpModal(!imageCaptureHelpModal));
            }}
          >
            <IconInfo className="text-white w-4 h-4" />
          </div>
          <div
            className="h-[60px] w-[60px] flex justify-center items-center"
            onClick={() => handleClose()}
          >
            <CloseIcon className="text-white w-4 h-4" />
          </div>
        </div>
        <div className="wrap-camera px-2 !bg-[#2B2C46] flex-grow">
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              width: '100%',
            }}
            className="h-full"
          >
            {currentIndex < capturedImages.length && (
              <img
                className="h-full object-cover"
                src={capturedImages[currentIndex].toDataURL()}
                alt=""
              />
            )}
            <Webcam
              audio={false}
              width={'100%'}
              className="rounded-lg"
              imageSmoothing={true}
              screenshotFormat="image/jpeg"
              forceScreenshotSourceSize={true}
              videoConstraints={{
                ...videoConstraints,
                facingMode,
              }}
              ref={webcamRef}
              style={{
                height: '100%',
                width: '100%',
                objectFit: 'cover',
                transform: `scale(${scaleCamera})`,
                display: currentIndex < capturedImages.length ? 'none' : '',
              }}
              screenshotQuality={1}
            >
              {({ getScreenshot }: any) => (
                <div
                  className={cx([
                    'absolute',
                    'left-0',
                    'right-0',
                    'mx-auto',
                    'bottom-8',
                    'items-center',
                    'justify-center',
                    'gap-x-8',
                    'mr-16',
                    currentIndex < capturedImages.length ? 'hidden' : 'flex',
                  ])}
                >
                  <div>
                    <input
                      id="icon-button-file"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(fs: any) => {
                        const file = fs.target?.files[0];
                        if (!file) return;
                        // dispatch(
                        //   setImageSearchInput(URL.createObjectURL(file)),
                        // );
                        if (multiImageUpload) {
                          setCurrentIndex(state => Math.min(state + 1, 2));

                          addCapturedImage(file);
                        } else {
                          handlerFindImage(file);
                        }
                      }}
                      accept="image/jpeg,image/png,image/webp"
                      onClick={event => {
                        // @ts-ignore
                        event.target.value = '';
                      }}
                    />
                    <label htmlFor="icon-button-file">
                      <div className="w-12 h-12 bg-[#615e669f] rounded-full border-2 border-solid border-white flex justify-center items-center">
                        <GalleryIcon className="text-white w-4 h-4" />
                      </div>
                    </label>
                  </div>

                  <button
                    onClick={() => {
                      const imageSrc = getScreenshot();
                      if (multiImageUpload) {
                        addCapturedImage(imageSrc);
                        setCurrentIndex(state => Math.min(state + 1, 2));
                      } else {
                        handlerFindImage(imageSrc);
                      }
                      // dispatch(setImageSearchInput(imageSrc));
                    }}
                    className={cx([
                      'w-fit',
                      'bg-transparent',
                      'border',
                      'border-white',
                      'rounded-full',
                      'flex',
                      'justify-center',
                      'items-center',
                      'p-0.5',
                    ])}
                  >
                    <svg
                      width="63"
                      height="63"
                      viewBox="0 0 63 63"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="31.5" cy="31.5" r="31.5" fill="white" />
                    </svg>
                  </button>
                </div>
              )}
            </Webcam>
          </div>
        </div>

        {capturedImages.length === 0 && (
          <div
            className={cx([
              'min-h-[60px]',
              'bg-[#2B2C46]',
              'flex',
              'justify-end',
            ])}
          />
        )}

        {capturedImages.length > 0 && (
          <>
            <div
              className={cx([
                'min-h-[106px]',
                'bg-primary',
                'flex',
                'justify-center',
                'items-center',
                'gap-x-1',
              ])}
            >
              {capturedImages?.map((image, index) => {
                return (
                  <div
                    key={index}
                    className={cx([
                      'rounded-md',
                      'p-1.5',
                      currentIndex === index
                        ? ' bg-[#3E36DC]'
                        : 'bg-transparent',
                    ])}
                  >
                    <img
                      className={cx([
                        'w-[70px]',
                        'h-[70px]',
                        'rounded-md',
                        'object-cover',
                      ])}
                      src={image.toDataURL()}
                      alt=""
                      onClick={() => {
                        setCurrentIndex(index);
                      }}
                    />
                  </div>
                );
              })}

              {[...Array(3 - capturedImages.length)]?.map((val, index) => {
                return (
                  <div
                    key={index}
                    className={cx([
                      'rounded-md',
                      'p-1.5',
                      currentIndex === index + capturedImages.length
                        ? ' bg-[#3E36DC]'
                        : 'bg-transparent',
                    ])}
                  >
                    <div
                      className={cx([
                        'w-[70px]',
                        'h-[70px]',
                        'flex',
                        'justify-center',
                        'items-center',
                        'rounded-md',
                        currentIndex === index + capturedImages.length
                          ? 'bg-primary'
                          : 'border border-[#AAABB5] border-dashed bg-[#55566B]',
                      ])}
                      key={index}
                      onClick={() => {
                        setCurrentIndex(index + capturedImages.length);
                      }}
                    ></div>
                  </div>
                );
              })}
            </div>
            <div className="w-full flex justify-center pb-6 bg-primary">
              <div
                className={cx([
                  '',
                  'h-11',
                  'w-full',
                  'px-7',
                  'max-w-[351px]',
                  'flex',
                  'justify-center',
                  'items-center',
                  'gap-x-4',
                  'rounded-3xl',
                  canMultiImageSearch
                    ? 'bg-secondary drop-shadow-md'
                    : 'bg-primary',
                ])}
                onClick={() => {
                  if (canMultiImageSearch) {
                    handleMultiImageSearch();
                  }
                }}
              >
                <div
                  className={cx([
                    'text-base',
                    'text-[#55566B]',
                    canMultiImageSearch ? 'text-white' : 'text-[#55566B]',
                  ])}
                >
                  Multi-Image Search for better matches
                </div>
                <NextArrowIcon
                  className={cx([
                    'text-[#55566B]',
                    canMultiImageSearch ? 'text-white' : 'text-[#55566B]',
                  ])}
                />
              </div>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}

export default CameraCustom;
