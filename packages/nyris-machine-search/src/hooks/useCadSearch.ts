import { useCallback } from 'react';
import { isEmpty } from 'lodash';
import { useClearRefinements } from 'react-instantsearch';

import { RectCoords } from '@nyris/nyris-api';

import { findCad, findRegions, getRequestImage } from 'services/visualSearch';

import useResultStore from 'stores/result/resultStore';
import useRequestStore from 'stores/request/requestStore';
import useUiStore from 'stores/ui/uiStore';

import { AppSettings } from 'types';

export const useCadSearch = () => {
  const preFilter = useRequestStore(state => state.preFilter);

  const setRegions = useRequestStore(state => state.setRegions);
  const setRequestImages = useRequestStore(state => state.setRequestImages);

  const setIsFindApiLoading = useUiStore(state => state.setIsFindApiLoading);
  const setShowFeedback = useUiStore(state => state.setShowFeedback);

  const setDetectedRegions = useResultStore(state => state.setDetectedRegions);
  const setFindApiProducts = useResultStore(state => state.setFindApiProducts);
  const setAlgoliaFilter = useRequestStore(state => state.setAlgoliaFilter);

  const setSessionId = useResultStore(state => state.setSessionId);
  const setRequestId = useResultStore(state => state.setRequestId);

  const { refine } = useClearRefinements();

  const cadSearch = useCallback(
    async ({
      file,
      settings,
      showFeedback = true,
      imageRegion,
      newSearch,
      clearPostFilter,
    }: {
      file: File;
      settings: AppSettings;
      showFeedback?: boolean;
      imageRegion?: RectCoords;
      newSearch?: boolean;
      clearPostFilter?: boolean;
    }) => {
      setIsFindApiLoading(true);

      let res: any;

      const preFilterValues = [
        {
          key: settings.visualSearchFilterKey,
          values: Object.keys(preFilter),
        },
      ];

      try {
        res = await findCad({
          file,
          settings,
          filters: !isEmpty(preFilter) ? preFilterValues : undefined,
        });

        if (clearPostFilter) {
          refine();
        }

        const responseBody = res?.responseBody;

        setFindApiProducts(responseBody?.results);
        setSessionId(responseBody?.session);
        setRequestId(responseBody?.id);

        const nonEmptyFilter: any[] = ['sku:DOES_NOT_EXIST<score=1> '];
        const filterSkus: any = responseBody?.results
          ? responseBody?.results
              .slice()
              .reverse()
              .map((f: any, i: number) => `sku:'${f.sku}'<score=${i}> `)
          : '';
        const filterSkusString = [...nonEmptyFilter, ...filterSkus].join('OR ');

        setAlgoliaFilter(filterSkusString);
        setIsFindApiLoading(false);

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
            setRequestImages([canvas]);
            // dispatch(setFirstSearchImage(canvas));

            try {
              let region: RectCoords | undefined = imageRegion;

              let res = await findRegions(canvas, settings);
              setDetectedRegions(res.regions, 0);
              region = res.selectedRegion;
              setRegions([region]);
            } catch (error) {}
          })
          .catch(error => {
            console.error('Error converting Blob to Canvas:', error);
          });

        if (showFeedback) {
          setShowFeedback(true);
        }
        // go back
        if (newSearch) {
          // dispatch(setFirstSearchResults(payload));
          // dispatch(setFirstSearchPrefilters(preFilter));
        }
      } catch (error) {
        setIsFindApiLoading(false);
      }

      return res?.responseBody;
    },
    [
      preFilter,
      refine,
      setAlgoliaFilter,
      setDetectedRegions,
      setFindApiProducts,
      setIsFindApiLoading,
      setRegions,
      setRequestId,
      setRequestImages,
      setSessionId,
      setShowFeedback,
    ],
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
