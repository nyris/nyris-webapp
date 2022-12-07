import { Box, Drawer } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import { RectCoords } from '@nyris/nyris-api';
import ReverseCamera from 'common/assets/icons/reverse_camera.svg';
import React, { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useHistory } from 'react-router-dom';
import Webcam from 'react-webcam';
import { createImage, findByImage } from 'services/image';
import { showFeedback } from 'Store/Nyris';
import {
  onToggleModalItemDetail,
  setImageSearchInput,
  setRequestImage,
  setSearchResults,
  updateStatusLoading,
} from 'Store/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';

interface Props {
  isToggle: boolean;
  onToggleModal?: any;
}

const FACING_MODE_USER = 'environment';
const FACING_MODE_ENVIRONMENT = 'user';

function CameraCustom(props: Props) {
  const { isToggle, onToggleModal } = props;
  const webcamRef: any = useRef(null);
  const [facingMode, setFacingMode] = useState(FACING_MODE_USER);
  const [scaleCamera, setScaleCamera] = useState<number>(1);
  const stateGlobal = useAppSelector(state => state);
  const { settings } = stateGlobal;
  const history = useHistory();
  const dispatch = useAppDispatch();

  const videoConstraints = {
    width: 1920,
    height: 1080,
    aspectRatio: 0.6666666667,
  };
  const handleClick = useCallback(() => {
    setFacingMode(prevState =>
      prevState === FACING_MODE_USER
        ? FACING_MODE_ENVIRONMENT
        : FACING_MODE_USER,
    );
  }, []);

  const handlerFindImage = async (image: any) => {
    dispatch(updateStatusLoading(true));
    let searchRegion: RectCoords | undefined = undefined;
    let imageConvert = await createImage(image);
    dispatch(setRequestImage(imageConvert));
    dispatch(setImageSearchInput(image));
    dispatch(onToggleModalItemDetail(false));
    findByImage(imageConvert, settings, searchRegion).then((res: any) => {
      dispatch(setSearchResults(res));
      return dispatch(showFeedback());
    });
    setTimeout(() => {
      dispatch(updateStatusLoading(false));
      handlerCloseModal();
      history.push('/result');
    }, 500);
  };

  const handlerCloseModal = () => {
    setFacingMode('environment');
    setScaleCamera(1);
    onToggleModal();
  };

  const { getInputProps } = useDropzone({
    onDrop: async (fs: File[]) => {
      let payload: any;
      let filters: any[] = [];
      dispatch(setImageSearchInput(URL.createObjectURL(fs[0])));
      let image = await createImage(fs[0]);
      dispatch(setRequestImage(image));
      // TODO support regions
      dispatch(updateStatusLoading(true));
      return findByImage(image, settings)
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
          setTimeout(() => {
            dispatch(updateStatusLoading(false));
            handlerCloseModal();
            history.push('/result');
          }, 500);
        })
        .catch((e: any) => {
          console.log('err camera_custom', e);
          dispatch(updateStatusLoading(false));
          handlerCloseModal();
        });
    },
  });

  return (
    <Box className="box-camera-custom">
      <Drawer
        anchor={'bottom'}
        open={isToggle}
        onClose={handlerCloseModal}
        className="modal-togggle-cam"
      >
        <Box className="wrap-camera">
          <button className="btn-close-modal right" onClick={handlerCloseModal}>
            <CloseIcon style={{ fontSize: 20, color: '#fff' }} />
          </button>
          <button className="btn-close-modal left" onClick={handlerCloseModal}>
            <svg
              width="18"
              height="10"
              viewBox="0 0 18 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 9.5L0 1.60526L1.26 0.5L9 7.28947L16.74 0.5L18 1.60526L9 9.5Z"
                fill="white"
              />
            </svg>
          </button>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              height: '100vh',
              width: '100%',
            }}
          >
            <Webcam
              audio={false}
              height={'100vh'}
              width={'100%'}
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
              }}
              screenshotQuality={1}
            >
              {({ getScreenshot }: any) => (
                <button
                  onClick={() => {
                    const imageSrc = getScreenshot();
                    handlerFindImage(imageSrc);
                  }}
                  className="btn-capture-camera"
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
              )}
            </Webcam>
          </div>

          <button className="btn-switch-camera" onClick={handleClick}>
            <img src={ReverseCamera} alt="" width={52} height={52} />
          </button>

          <div className="box-scale-camera">
            <button
              className={`${scaleCamera === 1 && 'active'}`}
              onClick={() => setScaleCamera(1)}
            >
              1
            </button>
            <button
              className={`${scaleCamera === 1.5 && 'active'}`}
              onClick={() => setScaleCamera(1.5)}
            >
              1.5
            </button>
            <button
              className={`${scaleCamera === 2 && 'active'}`}
              onClick={() => setScaleCamera(2)}
            >
              2
            </button>
          </div>
          <div className="wrap-box-input-mobile custom-library">
            <input
              accept="image/*"
              id="icon-button-file"
              type="file"
              style={{ display: 'none' }}
              {...getInputProps({
                onClick: e => {
                  e.stopPropagation();
                },
              })}
            />
            <label htmlFor="icon-button-file">
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '100%',
                  padding: 7,
                  backgroundColor: '#F3F3F5',
                }}
              >
                <PhotoLibraryIcon style={{ fontSize: 20, color: 'red' }} />
              </IconButton>
            </label>
          </div>
        </Box>
      </Drawer>
    </Box>
  );
}

export default CameraCustom;
