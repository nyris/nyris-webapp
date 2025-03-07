import { Options, Splide, SplideSlide } from '@splidejs/react-splide';
import React, { useMemo, useRef } from 'react';

import '@splidejs/react-splide/css';
import '@splidejs/react-splide/css/core';

import './ImagePreviewCarousel.scss';
import { useMediaQuery } from 'react-responsive';

interface Props {
  imgItem: any[];
  onSearchImage?: any;
  handlerCloseModal?: any;
  setSelectedImage: (url: string) => void;
}

export const ImagePreviewCarousel = (props: Props) => {
  let { imgItem, setSelectedImage } = props;
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const mainRef: any = useRef(null);
  const thumbsRef: any = useRef(null);

  const maxWidth = useMemo(() => {
    const contentWidth = 75 + 58 * imgItem.length;
    const modalWidth = isMobile ? 240 : 460;
    return contentWidth < modalWidth ? contentWidth : modalWidth;
  }, [imgItem.length, isMobile]);

  const mainOptions: Options = useMemo(
    () => ({
      type: 'slide',
      perPage: 1,
      perMove: 1,
      gap: '1rem',
      pagination: false,
      arrows: false,
      // width: isMobile ? 340 : 370,
    }),
    [],
  );

  const thumbsOptions: Options = useMemo(
    () => ({
      type: 'slide',
      rewind: true,
      gap: '1rem',
      pagination: false,
      fixedWidth: 40,
      fixedHeight: 40,
      cover: true,
      focus: 'center',
      isNavigation: true,
      arrows: imgItem.length > 1,
      width: maxWidth,
    }),
    [imgItem.length, maxWidth],
  );

  const renderSlides = (thumbs = false) => {
    return imgItem.map(slide => (
      <SplideSlide key={slide.url} className={thumbs ? '' : 'img-container'}>
        <img
          style={{ objectFit: 'contain', height: '100%' }}
          alt="preview"
          src={slide.url}
        />
      </SplideSlide>
    ));
  };

  React.useEffect(() => {
    if (mainRef.current && thumbsRef.current && thumbsRef.current?.splide) {
      mainRef.current.sync(thumbsRef.current.splide);
    }
  }, []);

  return (
    <>
      <Splide
        onActive={(e: any) => {
          setSelectedImage(
            e?.root?.querySelector('li.is-active')?.querySelector('img')?.src,
          );
        }}
        options={mainOptions}
        ref={mainRef}
        style={{ maxWidth: '100%', height: isMobile ? '80%' : '' }}
      >
        {renderSlides()}
      </Splide>

      <div className={`thumbs-list`}>
        <Splide options={thumbsOptions} ref={thumbsRef}>
          {renderSlides(true)}
        </Splide>
      </div>
    </>
  );
};
