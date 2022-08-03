import React, { useEffect } from "react";
import Webcam from "react-webcam";

const WebcamCapture = () => {
  const webcamRef: any = React.useRef(null);
  const [imgSrc, setImgSrc] = React.useState(null);
  const videoConstraints = {
    width: { min: 480 },
    height: { min: 720 },
    aspectRatio: 0.6666666667
  };

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);

  return (
    <>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        // videoConstraints={videoConstraints}
        videoConstraints={videoConstraints}
        
      />
      <button onClick={capture}>Capture photo</button>
      {imgSrc && <img src={imgSrc} />}
    </>
  );
};
export default WebcamCapture;
