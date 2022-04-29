import { Typography } from "@material-ui/core";
import React from "react";

interface ExampleImagesProps {
  images: string[];
  onExampleImageClicked: (url: string) => void;
}

const ExampleImages: React.FC<ExampleImagesProps> = ({
  images,
  onExampleImageClicked,
}) => {
  if (images.length === 0) {
    return null;
  }
  return (
    <section className="useExampleImg">
      <Typography className="title-box">
        You can also try one of these pictures:
      </Typography>
      <div className="exampleImages">
        <div className="exImagesWrap">
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
