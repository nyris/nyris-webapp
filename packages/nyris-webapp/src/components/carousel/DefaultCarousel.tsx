import { Box, Button } from "@material-ui/core";
import React from "react";
import { Carousel } from "react-responsive-carousel";
import ChevronRightOutlinedIcon from "@material-ui/icons/ChevronRightOutlined";
import ChevronLeftOutlinedIcon from "@material-ui/icons/ChevronLeftOutlined";
interface Props {
  imgItem: any[];
}

function DefaultCarousel(props: Props) {
  const { imgItem } = props;
  console.log("imgItem", imgItem);

  return (
    <Carousel
      showThumbs={true}
      infiniteLoop={false}
      showStatus={false}
      showIndicators={false}
      className={imgItem.length > 1 ? "" : "hide-btn-arrow"}
      renderArrowNext={(onClickHandler, hasPrev, label) => (
        <Button onClick={onClickHandler} className="btn-carousel-right">
          <ChevronRightOutlinedIcon
            className="icon-ct"
            style={{ color: "#55566B" }}
          />
        </Button>
      )}
      renderArrowPrev={(onClickHandler, hasPrev, label) => (
        <Button onClick={onClickHandler} className="btn-carousel-left">
          <ChevronLeftOutlinedIcon
            className="icon-ct"
            style={{ color: "#55566B" }}
          />
        </Button>
      )}
    >
      {imgItem?.map((item: any, index: any) => {
        return (
          <Box key={index} style={{height: '100%'}}>
            <img style={{height: '100%'}} src={imgItem ? item?.url : ""} alt="image_product" />
          </Box>
        );
      })}
    </Carousel>
  );
}

export default DefaultCarousel;
