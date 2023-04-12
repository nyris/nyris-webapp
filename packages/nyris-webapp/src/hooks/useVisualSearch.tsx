import { RectCoords } from '@nyris/nyris-api';
import { useCallback } from 'react';
import { useMediaQuery } from 'react-responsive';
import { feedbackClickEpic } from 'services/Feedback';
import { createImage, findByImage, findRegions } from 'services/image';
import { showFeedback, showResults } from 'Store/Nyris';
import {
  loadingActionResults,
  onToggleModalItemDetail,
  setImageSearchInput,
  setRegions,
  setRequestImage,
  setSearchResults,
  setSelectedRegion,
  updateStatusLoading,
} from 'Store/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';

export const useVisualSearch = () => {
  const dispatch = useAppDispatch();
  const stateGlobal = useAppSelector((state: any) => state);
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });

  const getUrlToCanvasFile = useCallback(
    async (url: string, position?: number) => {
      const {
        search: { keyFilter },
        settings,
      } = stateGlobal;

      dispatch(updateStatusLoading(true));
      if (isMobile) {
        // executeScroll();
        // setOpenModalImage(false);
        dispatch(onToggleModalItemDetail(false));
      }
      dispatch(showResults());
      dispatch(loadingActionResults());
      dispatch(setImageSearchInput(url));
      let image = await createImage(url);
      dispatch(setRequestImage(image));

      if (position) {
        feedbackClickEpic(stateGlobal, position);
        return;
      }
      let searchRegion: RectCoords | undefined = undefined;

      if (settings.regions) {
        let res = await findRegions(image, settings);
        searchRegion = res.selectedRegion;
        dispatch(setRegions(res.regions));
        dispatch(setSelectedRegion(searchRegion));
      }
      const preFilter = [
        {
          key: settings.visualSearchFilterKey,
          values: [`${keyFilter}`],
        },
      ];
      findByImage({
        image,
        settings,
        region: searchRegion,
        filters: keyFilter ? preFilter : undefined,
      }).then(res => {
        dispatch(setSearchResults(res));
        dispatch(showFeedback());
        dispatch(updateStatusLoading(false));
        return;
      });
    },
    [dispatch, stateGlobal, isMobile],
  );

  return { getUrlToCanvasFile };
};
