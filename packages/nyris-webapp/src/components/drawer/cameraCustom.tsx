import { Box, Drawer } from "@material-ui/core";
import WebcamCapture from "components/camera/screenshot";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

interface Props {
  isToggle: boolean;
  onToggleModal?: any;
}

const FACING_MODE_USER = "user";
const FACING_MODE_ENVIRONMENT = "environment";

function CameraCustom(props: Props) {
  const { isToggle, onToggleModal } = props;
  const webcamRef: any = useRef(null);
  const [facingMode, setFacingMode] = useState(FACING_MODE_USER);
  const [loading, setLoading] = useState(true);
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
  }, [webcamRef]);
  const videoConstraints = {
    width: { min: 480 },
    height: { min: 720 },
    aspectRatio: 0.6666666667,
  };
  const handleClick = useCallback(() => {
    setFacingMode((prevState) =>
      prevState === FACING_MODE_USER
        ? FACING_MODE_ENVIRONMENT
        : FACING_MODE_USER
    );
  }, []);

  return (
    <Box className="box-camera-custom">
      <Drawer anchor={"bottom"} open={isToggle} onClose={onToggleModal}>
        <Webcam
          audio={false}
          // height={200}
          // width={200}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            ...videoConstraints,
            facingMode,
          }}
          ref={webcamRef}
        />
        {/* <WebcamCapture /> */}
        <button onClick={handleClick}>Switch camera</button>
        {/* <Webcam
          audio={false}
          height={"600px"}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={"100%"}
          videoConstraints={videoConstraints}
        />
        {({ getScreenshot }: any) => (
          <button
            onClick={() => {
              const imageSrc = getScreenshot();
            }}
          >
            Capture photo
          </button>
        )} */}
      </Drawer>
    </Box>
  );
}

export default CameraCustom;
