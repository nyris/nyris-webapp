import { useState, memo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import './ExperienceVisualSearch.scss';
import { ReactComponent as ExperienceIcon } from 'common/experience-visual-icon.svg';
import { useAppDispatch, useAppSelector } from '../../Store/Store';
import {
  loadingActionResults,
  updateStatusLoading,
} from '../../Store/search/Search';
import { useImageSearch } from 'hooks/useImageSearch';
import { useHistory } from 'react-router-dom';
import { Icon } from '@nyris/nyris-react-components';

function ExperienceVisualSearch({
  experienceVisualSearchBlobs,
}: {
  experienceVisualSearchBlobs: Blob[];
}) {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector(state => state);
  const [showModal, setShowModal] = useState(false);
  const button = useRef(null);
  let interval = useRef<NodeJS.Timeout | null>(null);
  const history = useHistory();

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
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  };

  const getUrlToCanvasFile = async (blob: string) => {
    dispatch(updateStatusLoading(true));
    dispatch(loadingActionResults());

    singleImageSearch({ image: blob, settings }).then(() => {
      dispatch(updateStatusLoading(false));
    });
    history.push('/result');
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
                {new Array(4).fill(1).map((val, index) => {
                  let itemImage: any;

                  if (index <= experienceVisualSearchBlobs.length - 1) {
                    itemImage = URL.createObjectURL(
                      experienceVisualSearchBlobs[index],
                    );
                  }
                  return (
                    <div
                      key={index}
                      className="experience-visual-search-image-container"
                      onClick={() => {
                        if (itemImage) {
                          modalToggle(false);
                          getUrlToCanvasFile(itemImage);
                        }
                      }}
                    >
                      <div
                        className={`experience-visual-search-image ${
                          !itemImage ? 'animate-pulse bg-gray-200' : ''
                        }`}
                        style={{
                          backgroundImage: `url(${itemImage})`,
                        }}
                      />
                      {itemImage && (
                        <div className="box-icon-modal">
                          <Icon
                            name="search_image"
                            width={16}
                            height={16}
                            color={'#AAABB5'}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export default memo(ExperienceVisualSearch);
