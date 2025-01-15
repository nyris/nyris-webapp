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
import { useTranslation } from 'react-i18next';

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

  const { t } = useTranslation();

  const [expand, setExpand] = useState(false);

  useEffect(() => {
    let intervalId: any;
    if (document.body.getBoundingClientRect().width >= 776) {
      if (!showModal) {
        intervalId = setInterval(() => {
          setExpand(s => !s);
        }, 3000);
      } else if (interval?.current) {
        clearInterval(interval?.current);
        setExpand(false);
      }
      return () => {
        clearInterval(intervalId);
      };
    } else {
      setExpand(true);
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
      <div className="flex flex-col items-center">
        <div
          ref={button}
          className={`group bg-[#3E36DC] w-[215px] desktop:w-10 hover:w-[215px] hover:gap-2 ${
            expand ? 'desktop:w-[215px] gap-2' : ''
          } h-10 flex flex-row justify-center items-center rounded-full cursor-pointer my-8 transition-all duration-300`}
          onClick={() => modalToggle(true)}
        >
          <span
            className={`${
              expand ? 'flex-grow max-w-fit' : 'flex-grow-0 w-0'
            } group-hover:flex-grow group-hover:max-w-fit overflow-hidden whitespace-nowrap text-sm font-semibold leading-4 text-center text-white break-keep transition-all duration-300`}
          >
            {t('Experience Visual Search')}
          </span>
          <div className="flex flex-grow-0">
            <ExperienceIcon className="" />
          </div>
        </div>
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
                {t('Experience Visual Search')}
              </div>
              <div className="custom-modal-body-subtitle">
                {t('Start your visual search by selecting an image below.')}
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
