import { Box, Drawer } from "@material-ui/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import CloseIcon from "@material-ui/icons/Close";
import ReverseCamera from "common/assets/icons/reverse_camera.svg";
import { useAppDispatch, useAppSelector } from "Store/Store";
import { RectCoords } from "@nyris/nyris-api";
import { createImage, findByImage } from "services/image";
import {
  setRequestImage,
  setSearchResults,
  updateStatusLoading,
} from "Store/Search";
import { showFeedback } from "Store/Nyris";
import { useHistory } from "react-router-dom";
interface Props {
  isToggle: boolean;
  onToggleModal?: any;
}

const FACING_MODE_USER = "environment";
const FACING_MODE_ENVIRONMENT = "user";

function CameraCustom(props: Props) {
  const { isToggle, onToggleModal } = props;
  const webcamRef: any = useRef(null);
  const [facingMode, setFacingMode] = useState(FACING_MODE_USER);
  const [scaleCamera, setScaleCamera] = useState<number>(1);
  const stateGlobal = useAppSelector((state) => state);
  const { search, settings } = stateGlobal;
  const history = useHistory();
  const dispatch = useAppDispatch();

  const videoConstraints = {
    aspectRatio: 0.6666666667,
  };
  const handleClick = useCallback(() => {
    setFacingMode((prevState) =>
      prevState === FACING_MODE_USER
        ? FACING_MODE_ENVIRONMENT
        : FACING_MODE_USER
    );
  }, []);

  const handlerFindImage = async (image: any) => {
    dispatch(updateStatusLoading(true));
    let searchRegion: RectCoords | undefined = undefined;
    let imageConvert = await createImage(image);
    dispatch(setRequestImage(imageConvert));
    findByImage(imageConvert, settings, searchRegion).then((res: any) => {
      dispatch(setSearchResults(res));
      return dispatch(showFeedback());
    });
    setTimeout(() => {
      dispatch(updateStatusLoading(false));
      handlerCloseModal();
      history.push("/result");
    }, 500);
  };

  const handlerCloseModal = () => {
    setFacingMode("environment");
    setScaleCamera(1);
    onToggleModal();
  };

  return (
    <Box className="box-camera-custom">
      <Drawer
        anchor={"bottom"}
        open={isToggle}
        onClose={handlerCloseModal}
        className="modal-togggle-cam"
      >
        <Box className="wrap-camera">
          <button className="btn-close-modal right" onClick={handlerCloseModal}>
            <CloseIcon style={{ fontSize: 20, color: "#fff" }} />
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
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              height: "80%",
              width: "100%",
            }}
          >
            <Webcam
              audio={false}
              height={"100vh"}
              width={"100%"}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                ...videoConstraints,
                facingMode,
              }}
              ref={webcamRef}
              style={{
                height: "100%",
                width: "100%",
                objectFit: "cover",
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
              className={`${scaleCamera === 1 && "active"}`}
              onClick={() => setScaleCamera(1)}
            >
              1
            </button>
            <button
              className={`${scaleCamera === 1.5 && "active"}`}
              onClick={() => setScaleCamera(1.5)}
            >
              1.5
            </button>
            <button
              className={`${scaleCamera === 2 && "active"}`}
              onClick={() => setScaleCamera(2)}
            >
              2
            </button>
          </div>
        </Box>
      </Drawer>
    </Box>
  );
}

export default CameraCustom;
