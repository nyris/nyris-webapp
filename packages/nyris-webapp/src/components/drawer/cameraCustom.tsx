// @ts-nocheck
import { Drawer } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import { RectCoords } from '@nyris/nyris-api';
import ReverseCamera from 'common/assets/icons/reverse_camera.svg';
import { isEmpty } from 'lodash';
import React, { useCallback, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Webcam from 'react-webcam';
import { createImage, find, findRegions } from 'services/image';
import {
  onToggleModalItemDetail,
  setImageSearchInput,
  setRequestImage,
  setSearchResults,
  updateStatusLoading,
  loadingActionResults,
  setRegions,
  setSelectedRegion,
} from 'Store/search/Search';
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
  const { search, settings } = stateGlobal;
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { preFilter } = search;

  const videoConstraints = {
    width: 1080,
    aspectRatio: 1.11111,
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
    dispatch(loadingActionResults());
    if (history.location.pathname !== '/result') {
      history.push('/result');
    }
    let region: RectCoords | undefined;
    let imageConvert = await createImage(image);
    dispatch(setRequestImage(imageConvert));
    dispatch(onToggleModalItemDetail(false));
    handlerCloseModal();

    if (settings.regions) {
      let res = await findRegions(imageConvert, settings);
      dispatch(setRegions(res.regions));
      region = res.selectedRegion;
      dispatch(setSelectedRegion(region));
    }

    const preFilterValues = [
      {
        key: settings.visualSearchFilterKey,
        values: Object.keys(preFilter) as string[],
      },
    ];
    let filters: any[] = [];

    find({
      image: imageConvert,
      settings,
      filters: !isEmpty(preFilter) ? preFilterValues : undefined,
      region,
    })
      .then((res: any) => {
        res?.results.forEach((item: any) => {
          filters.push({
            sku: item.sku,
            score: item.score,
          });
        });
        const payload = {
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
  };

  const handlerCloseModal = () => {
    setFacingMode('environment');
    setScaleCamera(1);
    onToggleModal();
  };

  return (
    <div className="box-camera-custom">
      <Drawer
        anchor={'bottom'}
        open={isToggle}
        onClose={handlerCloseModal}
        className="modal-togggle-cam"
      >
        <div className="wrap-camera">
          <button
            className="btn-close-modal right"
            style={{
              backgroundColor: '#666666',
            }}
            onClick={handlerCloseModal}
          >
            <CloseIcon style={{ fontSize: 20, color: '#fff' }} />
          </button>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              width: '100%',
            }}
            className="full-height"
          >
            <Webcam
              audio={false}
              width={'100%'}
              className="full-height"
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
                    dispatch(setImageSearchInput(imageSrc));
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

          <div
            className="box-scale-camera"
            style={{
              backgroundColor: settings.theme?.secondaryColor,
            }}
          >
            <button
              className={`${scaleCamera === 1 && 'active'}`}
              style={{
                backgroundColor: scaleCamera === 1 && 'active' ? 'white' : '',
                color: scaleCamera === 1 && 'active' ? 'black' : 'white',
              }}
              onClick={() => setScaleCamera(1)}
            >
              1
            </button>
            <button
              className={`${scaleCamera === 1.5 && 'active'}`}
              style={{
                backgroundColor: scaleCamera === 1.5 && 'active' ? 'white' : '',
                color: scaleCamera === 1.5 && 'active' ? 'black' : 'white',
              }}
              onClick={() => setScaleCamera(1.5)}
            >
              1.5
            </button>
            <button
              className={`${scaleCamera === 2 && 'active'}`}
              style={{
                backgroundColor: scaleCamera === 2 && 'active' ? 'white' : '',
                color: scaleCamera === 2 && 'active' ? 'black' : 'white',
              }}
              onClick={() => setScaleCamera(2)}
            >
              2
            </button>
          </div>
          <div className="wrap-box-input-mobile custom-library">
            <input
              id="icon-button-file"
              type="file"
              style={{ display: 'none' }}
              onChange={(fs: any) => {
                const file = fs.target?.files[0];
                if (!file) return;
                dispatch(setImageSearchInput(URL.createObjectURL(file)));
                handlerFindImage(file);
              }}
              accept="image/jpeg,image/png,image/webp"
              onClick={event => {
                // @ts-ignore
                event.target.value = '';
              }}
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
        </div>
      </Drawer>
    </div>
  );
}

export default CameraCustom;
