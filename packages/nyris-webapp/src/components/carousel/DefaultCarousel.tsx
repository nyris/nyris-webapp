import { Box, Button } from '@material-ui/core';
import { useMediaQuery } from 'react-responsive';
import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import ChevronLeftOutlinedIcon from '@material-ui/icons/ChevronLeftOutlined';
interface Props {
  imgItem: any[];
  onSearchImage?: any;
  handlerCloseModal?: any;
}

function DefaultCarousel(props: Props) {
  const { imgItem, onSearchImage, handlerCloseModal } = props;
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });

  return (
    <Carousel
      showThumbs={isMobile ? false : true}
      infiniteLoop={false}
      showStatus={false}
      showIndicators={false}
      thumbWidth={40}
      className={imgItem.length > 1 ? '' : 'hide-btn-arrow'}
      onClickItem={(index: number, item: React.ReactNode) => {
        handlerCloseModal();
        onSearchImage(imgItem[0].url);
      }}
      renderArrowNext={(onClickHandler, hasPrev, label) => (
        <Button onClick={onClickHandler} className="btn-carousel-right">
          <ChevronRightOutlinedIcon
            className="icon-ct"
            style={{ color: '#55566B' }}
          />
        </Button>
      )}
      renderArrowPrev={(onClickHandler, hasPrev, label) => (
        <Button onClick={onClickHandler} className="btn-carousel-left">
          <ChevronLeftOutlinedIcon
            className="icon-ct"
            style={{ color: '#55566B' }}
          />
        </Button>
      )}
    >
      {imgItem?.map((item: any, index: any) => {
        return (
          <Box
            key={index}
            style={{ height: '100%' }}
            className="box-slider-image-result"
          >
            <img
              style={{ maxHeight: '400px' }}
              src={imgItem ? item?.url : ''}
              alt="image_product"
            />
          </Box>
        );
      })}
    </Carousel>
  );
}

export default DefaultCarousel;
// thumbs animated
