import { RectCoords } from '@nyris/nyris-api';
import { useCallback } from 'react';
import { findCad } from 'services/image';
import useRequestStore from 'Store/requestStore';
import {
  setFirstSearchResults,
  setRequestImage,
  setSearchResults,
  setShowFeedback,
  updateStatusLoading,
} from 'Store/search/Search';
import { useAppDispatch } from 'Store/Store';
import { AppSettings } from 'types';

export const useCadSearch = () => {
  const dispatch = useAppDispatch();

  const { setRequestImages } = useRequestStore(state => ({
    setRequestImages: state.setRequestImages,
  }));

  const cadSearch = useCallback(
    async ({
      file,
      settings,
      showFeedback = true,
      imageRegion,
      newSearch,
    }: {
      file: File;
      settings: AppSettings;
      showFeedback?: boolean;
      imageRegion?: RectCoords;
      newSearch?: boolean;
    }) => {
      let res: any;

      let filters: any[] = [];
      // const canvas = document.createElement('canvas');

      dispatch(setRequestImage(file));
      setRequestImages([file as unknown as HTMLCanvasElement]);

      try {
        res = await findCad({
          file,
          settings,
        });

        res?.results.forEach((item: any) => {
          filters.push({
            sku: item.sku,
            score: item.score,
          });
        });
        const payload = {
          ...res,
          filters,
        };
        dispatch(setSearchResults(payload));

        if (showFeedback) {
          dispatch(setShowFeedback(true));
        }
        // go back
        if (newSearch) {
          dispatch(setFirstSearchResults(payload));
          // dispatch(setFirstSearchImage(file));
          // dispatch(setFirstSearchPrefilters(preFilter));
        }
      } catch (error) {
        dispatch(updateStatusLoading(false));
      }

      return res;
    },
    [dispatch, setRequestImages],
  );

  return { cadSearch };
};
