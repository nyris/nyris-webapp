// @ts-nocheck

import { RectCoords } from '@nyris/nyris-api';
import { isEmpty } from 'lodash';
import { useCallback } from 'react';
import { createImage, find, findMulti, findRegions } from 'services/image';
import useRequestStore from 'Store/requestStore';
import useResultStore from 'Store/resultStore';
import {
  setFirstSearchImage,
  setFirstSearchPrefilters,
  setFirstSearchResults,
  setRegions,
  setRequestImage,
  setSearchResults,
  setSelectedRegion,
  setShowFeedback,
  updateStatusLoading,
} from 'Store/search/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { AppSettings } from 'types';
import { compressImage } from 'utils';
import convert from 'heic-convert/browser';

export const useImageSearch = () => {
  const dispatch = useAppDispatch();

  const preFilter = useAppSelector(state => state.search.preFilter);
  const firstSearchResults = useAppSelector(
    state => state.search.firstSearchResults,
  );
  const regions = useAppSelector(state => state.settings.regions);

  const { setRequestImages, setImageRegions } = useRequestStore(state => ({
    setRequestImages: state.setRequestImages,
    setImageRegions: state.setRegions,
    requestImages: state.requestImages,
    regions: state.regions,
  }));

  const { setDetectedObject } = useResultStore(state => ({
    setDetectedObject: state.setDetectedObject,
  }));

  const singleImageSearch = useCallback(
    async ({
      image,
      settings,
      showFeedback = true,
      imageRegion,
      newSearch,
      compress = true,
      preFilterParams,
    }: {
      image: any;
      settings: AppSettings;
      showFeedback?: boolean;
      imageRegion?: RectCoords;
      newSearch?: boolean;
      compress?: boolean;
      preFilterParams?: Record<string, boolean>;
    }) => {
      let region: RectCoords | undefined = imageRegion;
      let res: any;
      let compressedBase64;

      let blob = image;

      if (['.heic', '.heif'].some(ex => image?.name?.endsWith(ex))) {
        const blobTemp = new Blob([image], { type: 'image/heif' });
        const buffer = new Uint8Array(await blobTemp.arrayBuffer());

        try {
          let outputBuffer = await convert({
            buffer: buffer, // the HEIC file buffer
            format: 'JPEG', // output format
          });
          blob = new Blob([outputBuffer], { type: 'image/jpeg' });
        } catch (error) {
          console.log('HEIC conversion error:', error);
        }
      }

      if (compress) {
        try {
          compressedBase64 = await compressImage(blob);
        } catch (error) {}
      }

      let canvasImage = await createImage(compressedBase64 || blob);

      let requestImage = await createImage(blob);

      if (!imageRegion) {
        dispatch(setRequestImage(canvasImage));
        setRequestImages([canvasImage]);
      }

      if (regions && !imageRegion) {
        try {
          let res = await findRegions(requestImage, settings);
          setDetectedObject(res.regions, 0);
          dispatch(setRegions(res.regions));
          region = res.selectedRegion;
          dispatch(setSelectedRegion(region));
          setImageRegions([region]);
        } catch (error) {
          console.log('Error finding regions', error);
        }
      }

      const preFilterValues = [
        {
          key: settings.visualSearchFilterKey,
          values: Object.keys(preFilterParams || preFilter),
        },
      ];
      let filters: any[] = [];

      try {
        res = await find({
          image: requestImage,
          settings,
          filters: !isEmpty(preFilterParams || preFilter)
            ? preFilterValues
            : undefined,
          region,
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
        if (!firstSearchResults || newSearch) {
          dispatch(setFirstSearchResults(payload));
          dispatch(setFirstSearchImage(canvasImage));
          dispatch(setFirstSearchPrefilters(preFilter));
        }
      } catch (error) {
        dispatch(updateStatusLoading(false));
      }

      return res;
    },
    [
      dispatch,
      firstSearchResults,
      preFilter,
      regions,
      setDetectedObject,
      setImageRegions,
      setRequestImages,
    ],
  );

  const multiImageSearch = useCallback(
    async ({
      images,
      settings,
      regions,
      showFeedback = true,
      preFilterParams,
    }: {
      images: HTMLCanvasElement[];
      regions: RectCoords[];
      settings: AppSettings;
      showFeedback?: boolean;
      preFilterParams?: Record<string, boolean>;
    }) => {
      const preFilterValues = [
        {
          key: settings.visualSearchFilterKey,
          values: Object.keys(preFilterParams || preFilter),
        },
      ];
      let filters: any[] = [];
      let res: any;
      try {
        const res = await findMulti({
          images,
          settings,
          regions,
          filters: !isEmpty(preFilterParams || preFilter)
            ? preFilterValues
            : undefined,
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
      } catch (error) {
        dispatch(updateStatusLoading(false));
      }

      return res;
    },
    [dispatch, preFilter],
  );

  return { singleImageSearch, multiImageSearch };
};
