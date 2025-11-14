// @ts-nocheck

import { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';

import { useImageSearch } from 'hooks/useImageSearch';
import { Icon } from '@nyris/nyris-react-components';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router';
import useRequestStore from 'stores/request/requestStore';
import { useLocation } from 'react-router';
import ImageCaptureHelpModal from './ImageCaptureHelpModal';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from './Drawer/Drawer';
import { useCadSearch } from 'hooks/useCadSearch';
import { isCadFile } from '@nyris/nyris-api';
import { clone } from 'lodash';
import { getFilters } from '../services/filter';
import { useTranslation } from 'react-i18next';

interface Props {
  show: boolean;
  onClose: any;
  newSearch?: boolean;
}

const FACING_MODE_USER = 'environment';

function CustomCamera(props: Props) {
  const { show: isToggle, onClose: onToggleModal, newSearch } = props;
  const settings = window.settings;
  const webcamRef: any = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { singleImageSearch } = useImageSearch();
  const { cadSearch } = useCadSearch();
  const { t } = useTranslation();

  const requestImages = useRequestStore(state => state.requestImages);
  const specifications = useRequestStore(state => state.specifications);
  const setSpecifications = useRequestStore(state => state.setSpecifications);
  const setRequestImages = useRequestStore(state => state.setRequestImages);
  const setNameplateNotificationText = useRequestStore(state => state.setNameplateNotificationText);
  const setAlgoliaFilter = useRequestStore(state => state.setAlgoliaFilter);
  const setPreFilter = useRequestStore(state => state.setPreFilter);
  const setShowLoading = useRequestStore(state => state.setShowLoading);
  const setNameplateImage = useRequestStore(state => state.setNameplateImage);
  const setShowNotMatchedError = useRequestStore(state => state.setShowNotMatchedError);
  const [capturedImages, setCapturedImages] = useState<HTMLCanvasElement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageCaptureHelpModal, setImageCaptureHelpModal] = useState(false);
  const [resultFilter, setResultFilter] = useState<any>([]);

  const videoConstraints = {
    width: 1080,
    aspectRatio: 1.11111,
  };

  const getPreFilters = async () => {
    getFilters(1000, settings)
      .then(res => {
        setResultFilter(res);
      })
      .catch((e: any) => {
        console.log('err getDataFilterDesktop', e);
      });
  }

  useEffect(() => {
    getPreFilters()
  }, []);

  const handlerFindImage = async (image: any) => {
    if (location.pathname !== '/result') {
      navigate('/result');
    }

    if (isCadFile(image)) {
      cadSearch({ file: image, settings, newSearch: true }).then(
        (res: any) => {},
      );

      return;
    }

    singleImageSearch({
      image: image,
      settings,
      newSearch,
      showFeedback: true,
    }).then((singleImageResp) => {
      const specificationPrefilter = singleImageResp.image_analysis?.specification?.prefilter_value || null;
      const hasPrefilter = resultFilter.filter((filter: any) => filter.values.includes(specificationPrefilter));
      if (specificationPrefilter) {
        setRequestImages([]);
        setShowNotMatchedError(false);
        if (hasPrefilter.length) {
          setSpecifications(clone(singleImageResp.image_analysis.specification));
          setNameplateImage(image);
          setPreFilter({[singleImageResp.image_analysis?.specification?.prefilter_value]: true});
          setAlgoliaFilter(`${settings.alogoliaFilterField}:'${singleImageResp.image_analysis?.specification?.prefilter_value}'`);

          setShowLoading(false);
          handleClose();

          setNameplateNotificationText(t('We have successfully defined the search criteria', { prefilter_value: specificationPrefilter, preFilterTitle: window.settings.preFilterTitle?.toLocaleLowerCase() }));
          setTimeout(() => {
            setNameplateNotificationText('');
          }, 5000);
        }
        if (!hasPrefilter.length && window.settings.preFilterOption) {
          setSpecifications(clone({...singleImageResp.image_analysis.specification, prefilter_value: '', specificationPrefilter}));
          setPreFilter({});
          setAlgoliaFilter('');
          setShowLoading(false);
          handleClose();
          setShowNotMatchedError(true);
          setTimeout(() => {
            setNameplateNotificationText(t('Extracted details from the nameplate could not be matched', { preFilterTitle: window.settings.preFilterTitle }));
          }, 1000);
          setTimeout(() => {
            setNameplateNotificationText('');
          }, 6000);
        }
      } else {
        if (specifications?.is_nameplate) {
          setSpecifications({...specifications, prefilter_value: ''});
        } else {
          setSpecifications({is_nameplate: false, prefilter_value: ''});
        }
        setShowLoading(false);
        handleClose();
      }
    });
    
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
      <Drawer
        open={imageCaptureHelpModal}
        onOpenChange={setImageCaptureHelpModal}
      >
        <DrawerContent className="bg-white p-0 m-auto overflow-y-hidden pt-2.5 h-full outline-none rounded-none">
          <DrawerHeader className="h-0 w-0 hidden">
            <DrawerTitle>Image Capture Help Modal</DrawerTitle>
          </DrawerHeader>
          <div
            className={
              'wrap-filter-desktop absolute top-0 flex items-center justify-center bg-black/50 w-screen h-screen z-[9999]'
            }
          >
            <ImageCaptureHelpModal
              handleClose={() => setImageCaptureHelpModal(s => !s)}
            />
          </div>
        </DrawerContent>
      </Drawer>
      <Drawer open={isToggle} onOpenChange={handleClose}>
        <DrawerContent className="bg-white p-0 m-auto overflow-y-hidden h-full outline-none rounded-none">
          <DrawerHeader className="h-0 w-0 hidden">
            <DrawerTitle>Camera</DrawerTitle>
          </DrawerHeader>
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
              className={twMerge([
                'flex',
                'justify-center',
                'items-center',
                'h-full',
                'overflow-hidden',
                'px-2',
                'bg-[#2B2C46]',
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
                        className={twMerge([
                          'absolute',
                          'left-0',
                          'right-0',
                          'mx-auto',
                          'bottom-24',
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
                            style={{}}
                            type="file"
                            name="file"
                            id="select_file"
                            className="absolute z-[-1] opacity-0"
                            placeholder="Choose photo"
                            accept={
                              '.stp,.step,.stl,.obj,.glb,.gltf,.heic,.heif,.pdf,image/*'
                            }
                            onChange={(fs: any) => {
                              const file = fs.target?.files[0];
                              if (!file) return;

                              handlerFindImage(file);
                            }}
                            onClick={event => {
                              // @ts-ignore
                              event.target.value = '';
                            }}
                          />
                          <label htmlFor="select_file">
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
                            handlerFindImage(imageSrc);
                          }}
                          className={twMerge([
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
                className={twMerge([
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
                  className={twMerge([
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
                        className={twMerge([
                          'rounded-md',
                          'p-1.5',
                          currentIndex === index
                            ? ' bg-[#3E36DC]'
                            : 'bg-transparent',
                        ])}
                      >
                        <img
                          className={twMerge([
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
                        className={twMerge([
                          'rounded-md',
                          'p-1.5',
                          currentIndex === index + capturedImages.length
                            ? ' bg-[#3E36DC]'
                            : 'bg-transparent',
                        ])}
                      >
                        <div
                          className={twMerge([
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
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
      {/* <div className="box-camera-custom">
        <Drawer
          anchor={'bottom'}
          open={isToggle}
          onClose={() => handleClose()}
          className="modal-togggle-cam !bg-[#2B2C46]"
        >

        </Drawer>

        
      </div> */}
    </>
  );
}

export default CustomCamera;
