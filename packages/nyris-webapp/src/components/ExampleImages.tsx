import { Button, Typography } from "@material-ui/core";
import React from "react";
import { useMediaQuery } from "react-responsive";
import IconCamera from "common/assets/images/open_camera.svg";
import IconQrCode from "common/assets/images/bar_code.svg";
import CameraCustom from "./drawer/cameraCustom";
interface ExampleImagesProps {
  images: string[];
  onExampleImageClicked: (url: string) => void;
  onToggleModalCamera?: any;
}

const ExampleImages: React.FC<ExampleImagesProps> = ({
  images,
  onExampleImageClicked,
  onToggleModalCamera,
}) => {
  const isMobile = useMediaQuery({ query: "(max-width: 776px)" });

  if (images.length === 0) {
    return null;
  }
  return (
    <section className="useExampleImg">
      {!isMobile && (
        <Typography className="title-box text-center">
          You can also try one of these pictures:
        </Typography>
      )}

      <div className="exampleImages d-flex justify-center">
        <div className="exImagesWrap">
          {isMobile && (
            <>
              <Button style={{ padding: 0 }} onClick={onToggleModalCamera}>
                <img src={IconCamera} alt="" />
              </Button>
              <Button style={{ padding: 0, transform: "scale(1.1)" }}>
                <img src={IconQrCode} alt="" />
              </Button>
            </>
          )}
          {images.map((i) => {
            return (
              <img
                key={i}
                src={i}
                alt=""
                onClick={() => onExampleImageClicked(i)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExampleImages;
