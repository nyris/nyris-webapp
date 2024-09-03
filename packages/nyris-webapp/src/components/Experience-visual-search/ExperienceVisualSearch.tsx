import { useState, memo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import './ExperienceVisualSearch.scss';
import { ReactComponent as ExperienceIcon } from 'common/experience-visual-icon.svg';
import { useAppDispatch, useAppSelector } from '../../Store/Store';
import { ReactComponent as IconSearchImage } from 'common/assets/icons/icon_search_image2.svg';
import {
  loadingActionResults,
  updateStatusLoading,
} from '../../Store/search/Search';
import { useImageSearch } from 'hooks/useImageSearch';

function ExperienceVisualSearch() {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector(state => state);
  const [showModal, setShowModal] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const button = useRef(null);
  let interval = useRef<NodeJS.Timeout | null>(null);

  const { singleImageSearch } = useImageSearch();

  useEffect(() => {
    if (document.body.getBoundingClientRect().width >= 776) {
      if (!showModal) {
        interval.current = setInterval(() => {
          if (button?.current) {
            (button.current as HTMLElement).classList.toggle('hover');
          }
        }, 3000);
      } else if (interval?.current) {
        clearInterval(interval?.current);
        if (
          button?.current &&
          !(button.current as HTMLElement).classList.contains('hover')
        ) {
          (button.current as HTMLElement).classList.toggle('hover');
        }
      }
      return () => {
        if (interval?.current) {
          clearInterval(interval?.current);
        }
      };
    }
  }, [showModal]);

  const modalToggle = (isOpen: boolean) => {
    setShowModal(isOpen);
    if (isOpen) {
      const randomImages = settings?.experienceVisualSearchImages?.slice(
        0,
        Math.min(settings?.experienceVisualSearchImages?.length, 4),
      );
      setImages(randomImages || []);
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  };

  const getUrlToCanvasFile = async (url: string) => {
    dispatch(updateStatusLoading(true));
    dispatch(loadingActionResults());

    singleImageSearch({ image: url, settings }).then(() => {
      dispatch(updateStatusLoading(false));
    });
  };

  return (
    <>
      <div
        ref={button}
        className="experience-visual-button"
        onClick={() => modalToggle(true)}
      >
        <span />
        <ExperienceIcon />
      </div>
      {showModal &&
        createPortal(
          <div
            className="custom-modal"
            onClick={e => {
              e.stopPropagation();
              modalToggle(false);
            }}
          >
            <div
              className="custom-modal-body"
              onClick={e => {
                e.stopPropagation();
              }}
            >
              <CloseOutlinedIcon
                style={{ fontSize: 24, color: '#55566B' }}
                className="close-icon"
                onClick={e => {
                  e.stopPropagation();
                  modalToggle(false);
                }}
              />
              <div className="custom-modal-body-title">
                Experience Visual Search
              </div>
              <div className="custom-modal-body-subtitle">
                Start your visual search by selecting an image below.
              </div>
              <div className="custom-modal-body-content experience-visual-search-images">
                {images.map(itemImage => (
                  <div
                    className="experience-visual-search-image-container"
                    onClick={() => {
                      modalToggle(false);
                      getUrlToCanvasFile(itemImage);
                    }}
                  >
                    <div
                      className="experience-visual-search-image"
                      style={{
                        backgroundImage: `url(${itemImage}?width=192&height=192)`,
                      }}
                    />
                    <div className="box-icon-modal">
                      <IconSearchImage
                        width={16}
                        height={16}
                        color={'#AAABB5'}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export default memo(ExperienceVisualSearch);
