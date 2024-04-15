import React, { useState, memo, useEffect, useRef} from 'react';
import { createPortal } from 'react-dom';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import './ExperienceVisualSearch.scss';
import { ReactComponent as ExperienceIcon } from 'common/experience-visual-icon.svg';
import { useAppDispatch, useAppSelector } from '../../Store/Store';
import { ReactComponent as IconSearchImage } from 'common/assets/icons/icon_search_image2.svg';
import {
  loadingActionResults,
  setImageSearchInput,
  setRegions,
  setRequestImage,
  setSearchResults,
  setSelectedRegion,
  updateStatusLoading
} from '../../Store/search/Search';
import { createImage, find, findRegions } from '../../services/image';
import { RectCoords } from '@nyris/nyris-api';
import { isEmpty } from 'lodash';

function ExperienceVisualSearch() {
  const dispatch = useAppDispatch();
  const { search, settings } = useAppSelector(state => state);
  const [showModal, setShowModal] = useState(false);
  const button = useRef(null);

  useEffect(() => {
    setInterval(() => {
      if (button?.current) {
        // (button.current as HTMLElement).classList.toggle('hover');
      }
    }, 3000);
  }, [button, setInterval]);

  const modalToggle = (isOpen: boolean) => {
    setShowModal(isOpen);
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  };
  const getUrlToCanvasFile = async (url: string) => {
    dispatch(updateStatusLoading(true));
    dispatch(loadingActionResults());
    dispatch(setImageSearchInput(url));
    let image = await createImage(url);
    dispatch(setRequestImage(image));

    let searchRegion: RectCoords | undefined = undefined;

    if (settings.regions) {
      let res = await findRegions(image, settings);
      searchRegion = res.selectedRegion;
      dispatch(setRegions(res.regions));
      dispatch(setSelectedRegion(searchRegion));
    }
    const preFilterValues = [
      {
        key: settings.visualSearchFilterKey,
        values: Object.keys(search.preFilter) as string[],
      },
    ];
    find({
      image,
      settings,
      region: searchRegion,
      filters: !isEmpty(search.preFilter) ? preFilterValues : undefined,
    }).then((res: any) => {
      dispatch(setSearchResults(res));
      dispatch(updateStatusLoading(false));
      return;
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
            onClick={(e) => {
              e.stopPropagation();
              modalToggle(false);
            }}
          >
            <div
              className="custom-modal-body"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <CloseOutlinedIcon
                style={{ fontSize: 24, color: '#55566B' }}
                className="close-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  modalToggle(false);
                }}
              />
              <div className="custom-modal-body-title">Experience Visual Search</div>
              <div className="custom-modal-body-subtitle">
                Choose from the array of images below to commence a visual search and explore further:
              </div>
              <div className="custom-modal-body-content experience-visual-search-images">
                {settings?.experienceVisualSearchImages?.map((itemImage) => (
                  <div
                    className="experience-visual-search-image-container"
                    onClick={() => {
                      modalToggle(false);
                      getUrlToCanvasFile(itemImage);
                    }}
                  >
                    <div
                      className="experience-visual-search-image"
                      style={{ backgroundImage: `url(${itemImage})` }}
                    />
                    <div
                      className="box-icon-modal"
                    >
                      <IconSearchImage width={16} height={16} color={'#AAABB5'} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

export default memo(ExperienceVisualSearch);