// @ts-nocheck
import cx from 'classnames';

import { Drawer } from '@material-ui/core';
import { useRef, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Webcam from 'react-webcam';
import { createImage } from 'services/image';
import {
  onToggleModalItemDetail,
  updateStatusLoading,
  loadingActionResults,
} from 'Store/search/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';

import useRequestStore from 'Store/requestStore';
import { useImageSearch } from 'hooks/useImageSearch';
import ImageCaptureHelpModal from 'components/ImageCaptureHelpModal';
import { createPortal } from 'react-dom';
import { compressImage } from 'utils';
import { Icon } from '@nyris/nyris-react-components';
import { isCadFile } from '@nyris/nyris-api';
import { useCadSearch } from 'hooks/useCadSearch';

interface Props {
  show: boolean;
  onClose: any;
  newSearch?: boolean;
}

const FACING_MODE_USER = 'environment';

function CameraCustom(props: Props) {
  const { show: isToggle, onClose: onToggleModal, newSearch } = props;
  const webcamRef: any = useRef(null);
  const settings = useAppSelector(state => state.settings);
  const history = useHistory();
  const dispatch = useAppDispatch();
  const isCadSearch = window.settings.cadSearch;
  const { singleImageSearch, multiImageSearch } = useImageSearch();

  const { requestImages, setRequestImages, regions } = useRequestStore(
    state => ({
      requestImages: state.requestImages,
      setRequestImages: state.setRequestImages,
      regions: state.regions,
    }),
  );
  const { cadSearch } = useCadSearch();

  const [capturedImages, setCapturedImages] = useState<HTMLCanvasElement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageCaptureHelpModal, setImageCaptureHelpModal] = useState(false);

  const multiImageUpload = requestImages.length > 0 && !newSearch;
  const canMultiImageSearch = capturedImages.length !== requestImages.length;

  const videoConstraints = {
    width: 1080,
    aspectRatio: 1.11111,
  };

  const addCapturedImage = async (image: any) => {
    const compressedBase64 = await compressImage(image);
    let imageConvert = await createImage(compressedBase64);
    setCapturedImages(state => [...state, imageConvert]);
  };

  const handleMultiImageSearch = () => {
    setRequestImages(capturedImages);
    dispatch(updateStatusLoading(true));
    dispatch(loadingActionResults());

    multiImageSearch({
      images: capturedImages,
      regions: regions,
      settings,
    }).then(() => {
      dispatch(updateStatusLoading(false));
    });

    handleClose();
  };

  const handlerFindImage = async (image: any) => {
    if (isCadFile(image) && isCadSearch) {
      dispatch(updateStatusLoading(true));
      dispatch(loadingActionResults());
      if (history.location.pathname !== '/result') {
        history.push('/result');
      }
      cadSearch({ file: image, settings, newSearch: true }).then((res: any) => {
        dispatch(updateStatusLoading(false));
      });
    } else {
      dispatch(updateStatusLoading(true));
      dispatch(loadingActionResults());
      if (history.location.pathname !== '/result') {
        history.push('/result');
      }

      singleImageSearch({
        image: image,
        settings,
        newSearch,
        showFeedback: true,
      }).then(() => {
        dispatch(updateStatusLoading(false));
      });
    }
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
    <>
      {imageCaptureHelpModal && (
        <>
          {createPortal(
            <>
              <div
                className={
                  'wrap-filter-desktop absolute top-0 flex items-center justify-center bg-black/50 w-screen h-screen z-[9999]'
                }
              >
                <ImageCaptureHelpModal
                  handleClose={() => setImageCaptureHelpModal(s => !s)}
                />
              </div>
            </>,
            document.body,
          )}
        </>
      )}
      <div className="box-camera-custom">
        <Drawer
          anchor={'bottom'}
          open={isToggle}
          onClose={() => handleClose()}
          className="modal-togggle-cam !bg-[#2B2C46]"
        >
          <div className="h-full flex flex-col overflow-hidden">
            <div className="min-h-[60px] bg-[#2B2C46] flex justify-end">
              <div
                className="h-[60px] w-[60px] flex justify-center items-center"
                onClick={() => {
                  setImageCaptureHelpModal(s => !s);
                }}
              >
                <Icon name="info" className="text-white w-4 h-4" />
              </div>
              <div
                className="h-[60px] w-[60px] flex justify-center items-center"
                onClick={() => handleClose()}
              >
                <Icon name="close" className="text-white w-4 h-4" />
              </div>
            </div>
            <div
              className={cx([
                'flex',
                'justify-center',
                'items-center',
                'h-full',
                'overflow-hidden',
                'px-2',
                'rounded-lg',
              ])}
            >
              <div className="wrap-camera h-full w-full !bg-[#55566B] rounded-lg">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    width: '100%',
                  }}
                  className="h-full rounded-lg"
                >
                  {currentIndex < capturedImages.length && (
                    <img
                      className="h-full object-contain"
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
                      facingMode: FACING_MODE_USER,
                    }}
                    ref={webcamRef}
                    style={{
                      height: '100%',
                      width: '100%',
                      objectFit: 'cover',
                      transform: `scale(${1})`,
                      display:
                        currentIndex < capturedImages.length ? 'none' : '',
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
                          currentIndex < capturedImages.length
                            ? 'hidden'
                            : 'flex',
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

                              if (multiImageUpload) {
                                setCurrentIndex(state =>
                                  Math.min(state + 1, 2),
                                );

                                addCapturedImage(file);
                              } else {
                                handlerFindImage(file);
                              }
                            }}
                            accept={`${
                              isCadSearch
                                ? '.stp,.step,.stl,.obj,.glb,.gltf,.tiff,.heic,.tif,'
                                : ''
                            }image/jpeg,image/png,image/webp`}
                            onClick={event => {
                              // @ts-ignore
                              event.target.value = '';
                            }}
                          />
                          <label htmlFor="icon-button-file">
                            <div className="w-12 h-12 bg-[#615e669f] rounded-full border-2 border-solid border-white flex justify-center items-center">
                              <Icon
                                name="gallery"
                                className="text-white w-4 h-4"
                              />
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

            {capturedImages.length > 0 && settings.multiImageSearch && (
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
                    <Icon
                      name="next_arrow"
                      className={cx([
                        'text-[#55566B]',
                        canMultiImageSearch ? 'text-white' : 'text-[#55566B]',
                      ])}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </Drawer>
      </div>
      {/* {!imageCaptureHelpModal && (
    
      )} */}
    </>
  );
}

export default CameraCustom;
