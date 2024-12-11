import { RectCoords } from '@nyris/nyris-api';
import { isEmpty } from 'lodash';
import { useCallback } from 'react';
import { findCad, findRegions, getRequestImage } from 'services/image';
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

export const useCadSearch = () => {
  const dispatch = useAppDispatch();
  const preFilter = useAppSelector(state => state.search.preFilter);

  const { setRequestImages, setImageRegions } = useRequestStore(state => ({
    setRequestImages: state.setRequestImages,
    setImageRegions: state.setRegions,
    requestImages: state.requestImages,
    regions: state.regions,
  }));

  const { setDetectedObject } = useResultStore(state => ({
    setDetectedObject: state.setDetectedObject,
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

      const preFilterValues = [
        {
          key: settings.visualSearchFilterKey,
          values: Object.keys(preFilter),
        },
      ];
      let filters: any[] = [];
      // const canvas = document.createElement('canvas');

      // dispatch(setRequestImage(file));
      // setRequestImages([file as unknown as HTMLCanvasElement]);

      try {
        res = await findCad({
          file,
          settings,
          filters: !isEmpty(preFilter) ? preFilterValues : undefined,
        });

        res?.responseBody?.results.forEach((item: any) => {
          filters.push({
            sku: item.sku,
            score: item.score,
          });
        });
        const payload = {
          ...res?.responseBody,
          filters,
        };
        dispatch(setSearchResults(payload));

        const queryParams = res?.requestUrl.split('?')[1];

        // Parse the query string
        const params = new URLSearchParams(queryParams);

        // Get the value of the 'img' parameter
        const imgValue = params.get('img');

        const image = await getRequestImage({
          url: encodeURIComponent(imgValue || ''),
          settings,
        });

        const blob: Blob = image.data;

        blobToCanvas(blob)
          .then(async canvas => {
            dispatch(setRequestImage(canvas));
            setRequestImages([canvas]);
            dispatch(setFirstSearchImage(canvas));

            try {
              let region: RectCoords | undefined = imageRegion;

              let res = await findRegions(canvas, settings);
              setDetectedObject(res.regions, 0);
              dispatch(setRegions(res.regions));
              region = res.selectedRegion;
              dispatch(setSelectedRegion(region));
              setImageRegions([region]);
            } catch (error) {}
          })
          .catch(error => {
            console.error('Error converting Blob to Canvas:', error);
          });

        if (showFeedback) {
          dispatch(setShowFeedback(true));
        }
        // go back
        if (newSearch) {
          dispatch(setFirstSearchResults(payload));
          dispatch(setFirstSearchPrefilters(preFilter));
        }
      } catch (error) {
        dispatch(updateStatusLoading(false));
      }

      return res?.responseBody;
    },
    [dispatch, preFilter, setDetectedObject, setImageRegions, setRequestImages],
  );

  return { cadSearch };
};

function blobToCanvas(blob: Blob): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    // Step 1: Create a new Image element
    const img = new Image();

    // Step 2: Create an Object URL from the Blob
    const url = URL.createObjectURL(blob);
    img.src = url;

    // Step 3: Wait for the image to load
    img.onload = () => {
      // Step 4: Create a Canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;

      // Step 5: Draw the image onto the Canvas
      ctx.drawImage(img, 0, 0);

      // Step 6: Revoke the Object URL to free memory
      URL.revokeObjectURL(url);

      // Resolve the Canvas element
      resolve(canvas);
    };

    // Handle errors
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image from Blob'));
    };
  });
}
