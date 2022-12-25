import { Options, Splide, SplideSlide } from '@splidejs/react-splide';
import React, { useRef } from 'react';
import '@splidejs/react-splide/dist/css/splide-core.min.css';
import '@splidejs/react-splide/dist/css/splide.min.css';
import './ImagePreviewCarousel.scss';

interface Props {
    imgItem: any[];
    onSearchImage?: any;
    handlerCloseModal?: any;
}

export const ImagePreviewCarousel = (props: Props) => {
    let { imgItem, onSearchImage, handlerCloseModal } = props;

    const mainRef:any = useRef(null);
    const thumbsRef:any = useRef(null);

    const mainOptions: Options = {
        type: 'loop',
        perPage: 1,
        perMove: 1,
        gap: '1rem',
        pagination: false,
        arrows: false,
    };

    const thumbsOptions: Options = {
        type: 'slide',
        rewind: true,
        gap: '1rem',
        pagination: false,
        fixedWidth: 40,
        fixedHeight: 40,
        cover: true,
        focus: 'center',
        isNavigation: true,
        arrows: imgItem.length > 1
    };

    const renderSlides = (thumbs=false) => {
        return imgItem.map((slide) => (
            <SplideSlide key={slide.url} className={thumbs ? "" : "img-container"}>
                <img alt="preview" src={slide.url} onClick={()=>{
                    if(!thumbs){
                        handlerCloseModal();
                        onSearchImage(slide.url);
                    }
                }
                }/>
            </SplideSlide>
        ));
    };

    React.useEffect(()=>{
        if (
            mainRef.current &&
            thumbsRef.current &&
            thumbsRef.current?.splide
        ) {
            mainRef.current.sync(thumbsRef.current.splide);
        }
    },[])

    return (
        <>
            <Splide
                options={mainOptions}
                ref={mainRef}
            >
                {renderSlides()}
            </Splide>

            <div className={`thumbs-list ${imgItem.length <= 1 ? 'd-none':''}`}>
                <Splide
                    options={thumbsOptions}
                    ref={thumbsRef}
                >
                    {renderSlides(true)}
                </Splide>
            </div>
        </>
    );
};
