import { RectCoords } from '@nyris/nyris-api';
import { isEmpty } from 'lodash';
import { useCallback } from 'react';
import { find, findRegions } from 'services/image';
import useRequestStore from 'Store/requestStore';
import {
  setRegions,
  setRequestImage,
  setSearchResults,
  setSelectedRegion,
  setShowFeedback,
  updateStatusLoading,
} from 'Store/search/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { AppSettings } from 'types';

export const useImageSearch = () => {
  const dispatch = useAppDispatch();
  const {
    search: { preFilter, firstSearchResults },
    settings: { regions },
  } = useAppSelector(state => state);

  const { setRequestImages, setImageRegions } = useRequestStore(state => ({
    setRequestImages: state.setRequestImages,
    setImageRegions: state.setRegions,
  }));

  const singleImageSearch = useCallback(
    async ({
      image,
      settings,
      showFeedback = true,
    }: {
      image: HTMLCanvasElement;
      settings: AppSettings;
      showFeedback?: boolean;
    }) => {
      let region: RectCoords | undefined;

      dispatch(setRequestImage(image));
      setRequestImages([image]);

      try {
        if (regions) {
          let res = await findRegions(image, settings);
          dispatch(setRegions(res.regions));
          region = res.selectedRegion;
          dispatch(setSelectedRegion(region));
          setImageRegions([region]);
        }
      } catch (error) {
      } finally {
        const preFilterValues = [
          {
            key: settings.visualSearchFilterKey,
            values: Object.keys(preFilter),
          },
        ];
        let filters: any[] = [];

        find({
          image: image,
          settings,
          filters: !isEmpty(preFilter) ? preFilterValues : undefined,
          region,
        })
          .then((res: any) => {
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
            dispatch(updateStatusLoading(false));

            if (showFeedback) {
              dispatch(setShowFeedback(true));
            }
            // go back
            if (!firstSearchResults) {
              // dispatch(setFirstSearchResults(payload));
              // dispatch(setFirstSearchImage(imageConvert));
              // dispatch(setFirstSearchPrefilters(preFilter));
              // dispatch(setFirstSearchThumbSearchInput(image));
            }
          })
          .catch((e: any) => {
            console.log('error input search', e);
            dispatch(updateStatusLoading(false));
          });
      }
    },
    [
      dispatch,
      firstSearchResults,
      preFilter,
      regions,
      setImageRegions,
      setRequestImages,
    ],
  );

  return { singleImageSearch };
};
