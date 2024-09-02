// @ts-nocheck

import classNames from "classnames";

import { ReactComponent as ReverseCamera } from "../assets/reverse_camera.svg";
import { ReactComponent as GalleryIcon } from "../assets/gallery.svg";

import { ReactComponent as CloseIcon } from "../assets/close.svg";

import React, { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import ScaleCameraButton from "./ScaleCameraButton";
import { createImage } from "../utils/image";

interface Props {
  onClose: any;
  onCapture: any;
}

const FACING_MODE_USER = "environment";
const FACING_MODE_ENVIRONMENT = "user";

function CameraCustom({ onClose, onCapture }: Props) {
  const webcamRef: any = useRef(null);
  const [facingMode, setFacingMode] = useState(FACING_MODE_USER);
  const [scaleCamera, setScaleCamera] = useState<number>(1);
  const videoConstraints = {
    width: 1080,
    aspectRatio: 1.11111,
  };

  const handleClick = useCallback(() => {
    setFacingMode((prevState) =>
      prevState === FACING_MODE_USER
        ? FACING_MODE_ENVIRONMENT
        : FACING_MODE_USER
    );
  }, []);

  const handlerFindImage = async (image: any) => {
    let imageConvert = await createImage(image);
    onCapture(imageConvert);
  };

  const handlerCloseModal = () => {
    setFacingMode("environment");
    setScaleCamera(1);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="h-full bg-[#1e1f31]">
      <div className="h-full">
        <div className="h-full">
          <button
            className={classNames([
              "flex",
              "justify-center",
              "items-center",
              "absolute",
              "right-5",
              "top-4",
              "bg-[#666]",
              "rounded-full",
              "z-10",
              "w-6",
              "h-6",
            ])}
            onClick={handlerCloseModal}
          >
            <CloseIcon style={{ fontSize: 20, color: "#fff" }} />
          </button>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              width: "100%",
            }}
            className="h-full"
          >
            <Webcam
              audio={false}
              width={"100%"}
              className="h-full min-w-full min-h-full overflow-hidden"
              imageSmoothing={true}
              screenshotFormat="image/jpeg"
              forceScreenshotSourceSize={true}
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
                    // dispatch(setImageSearchInput(imageSrc));
                  }}
                  className={classNames([
                    "absolute",
                    "bottom-20",
                    "w-fit",
                    "bg-transparent",
                    "border",
                    "border-white",
                    "border-solid",
                    "rounded-full",
                    "flex",
                    "justify-center",
                    "items-center",
                    "p-0.5",
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
              )}
            </Webcam>
          </div>

          <button
            className="absolute left-10 bottom-16 bg-transparent border-none z-10"
            onClick={handleClick}
          >
            <ReverseCamera style={{ fontSize: 20, color: "#fff" }} />
          </button>

          <div
            className={classNames([
              "absolute",
              "left-0",
              "right-0",
              "bottom-44",
              "flex",
              "justify-center",
              "items-center",
            ])}
          >
            <div
              className={classNames([
                "flex",
                "gap-x-2",
                "bg-[#2b2c46b3]",
                "rounded-2xl",
                "p-1",
              ])}
            >
              <ScaleCameraButton
                scale={1}
                scaleCamera={scaleCamera}
                setScaleCamera={setScaleCamera}
              />
              <ScaleCameraButton
                scale={1.5}
                scaleCamera={scaleCamera}
                setScaleCamera={setScaleCamera}
              />
              <ScaleCameraButton
                scale={2}
                scaleCamera={scaleCamera}
                setScaleCamera={setScaleCamera}
              />
            </div>
          </div>
          <div
            className={classNames([
              "absolute",
              "bottom-16",
              "right-10",
              "w-14",
              "h-14",
              "bg-[#686778b3]",
              "rounded-full",
              "flex",
              "justify-center",
              "items-center",
              "border-2",
              "border-white",
              "p-0.5",
              "cursor-pointer",
            ])}
          >
            <input
              id="icon-button-file"
              type="file"
              style={{ display: "none" }}
              onChange={(fs: any) => {
                const file = fs.target?.files[0];
                if (!file) return;
                // dispatch(setImageSearchInput(URL.createObjectURL(file)));
                handlerFindImage(file);
              }}
              accept="image/jpeg,image/png,image/webp"
              onClick={(event) => {
                // @ts-ignore
                event.target.value = "";
              }}
            />
            <label htmlFor="icon-button-file" className="cursor-pointer">
              <div color="primary" aria-label="upload picture" component="span">
                <GalleryIcon className="w-6 h-6 text-white" />
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CameraCustom;
