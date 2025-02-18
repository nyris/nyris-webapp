import { useCallback } from 'react';
import { RectCoords } from '@nyris/nyris-api';
import { isEmpty } from 'lodash';

import { createImage, find, findRegions } from 'services/visualSearch';

import useResultStore from 'stores/result/resultStore';
import useRequestStore from 'stores/request/requestStore';

import { AppSettings } from 'types';
import { compressImage } from 'utils/compressImage';
import useUiStore from 'stores/ui/uiStore';
import { useClearRefinements } from 'react-instantsearch';
import useMachineStore from 'stores/machine/machineStore';

export const useImageSearch = () => {
  const setRegions = useRequestStore(state => state.setRegions);
  const setRequestImages = useRequestStore(state => state.setRequestImages);
  const setAlgoliaFilter = useRequestStore(state => state.setAlgoliaFilter);
  const setVisualSearchSkus = useRequestStore(
    state => state.setVisualSearchSkus,
  );

  const preFilter = useRequestStore(state => state.preFilter);
  const setFirstSearchImage = useRequestStore(
    state => state.setFirstSearchImage,
  );
  const metaFilter = useRequestStore(state => state.metaFilter);
  const setFirstSearchPreFilter = useRequestStore(
    state => state.setFirstSearchPreFilter,
  );

  const setIsFindApiLoading = useUiStore(state => state.setIsFindApiLoading);
  const setShowFeedback = useUiStore(state => state.setShowFeedback);

  const setDetectedRegions = useResultStore(state => state.setDetectedRegions);
  const setFindApiProducts = useResultStore(state => state.setFindApiProducts);
  const setSessionId = useResultStore(state => state.setSessionId);
  const setRequestId = useResultStore(state => state.setRequestId);
  const firstSearchResults = useResultStore(state => state.firstSearchResults);
  const setFirstSearchResults = useResultStore(
    state => state.setFirstSearchResults,
  );

  const autoFocus = useMachineStore(state => state.autoFocus);
  const setSelectedPartsName = useMachineStore(
    state => state.setSelectedPartsName,
  );
  const setMachineView = useMachineStore(state => state.setMachineView);
  const setReverseSelectedProduct = useMachineStore(
    state => state.setReverseSelectedProduct,
  );
  const setPartsView = useMachineStore(state => state.setPartsView);

  const { refine } = useClearRefinements();

  const singleImageSearch = useCallback(
    async ({
      image,
      settings,
      showFeedback = true,
      imageRegion,
      newSearch,
      compress = true,
      preFilterParams,
      clearPostFilter,
    }: {
      image: any;
      settings: AppSettings;
      showFeedback?: boolean;
      imageRegion?: RectCoords;
      newSearch?: boolean;
      compress?: boolean;
      preFilterParams?: Record<string, boolean>;
      clearPostFilter?: boolean;
    }) => {
      setIsFindApiLoading(true);
      // setAlgoliaProducts([]);

      let region: RectCoords | undefined = imageRegion;
      let res: any;
      let compressedBase64;

      let blob = image;

      if (['.heic', '.heif'].some(ex => image?.name?.endsWith(ex))) {
        const blobTemp = new Blob([image], { type: 'image/heif' });
        const buffer = new Uint8Array(await blobTemp.arrayBuffer());

        try {
          const convert = await import('heic-convert/browser');

          let outputBuffer = await convert.default({
            // @ts-ignore
            buffer: buffer, // the HEIC file buffer
            format: 'JPEG',
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
        setRequestImages([canvasImage]);
      }

      if (!imageRegion) {
        try {
          let res = await findRegions(requestImage, settings);
          setDetectedRegions(res.regions, 0);
          region = res.selectedRegion;
          setRegions([region]);
        } catch (error) {}
      }

      const preFilterValues = [
        {
          key: settings.visualSearchFilterKey,
          values: Object.keys(preFilterParams || preFilter),
        },
      ];

      try {
        res = await find({
          image: requestImage,
          settings,
          filters: !isEmpty(preFilterParams || preFilter)
            ? preFilterValues
            : metaFilter
            ? [
                {
                  key: settings.visualSearchFilterKey,
                  values: [metaFilter],
                },
              ]
            : undefined,
          region,
        });

        if (clearPostFilter) {
          refine();
        }

        setFindApiProducts(res?.results);
        setSessionId(res?.session);
        setRequestId(res?.id);

        const filterSkus: any = res?.results
          ? res?.results
              .slice()
              .reverse()
              .map((f: any, i: number) => `sku:'${f.sku}'<score=${i}> `)
          : '';
        const filterSkusString = [...filterSkus].join('OR ');

        setAlgoliaFilter(filterSkusString);
        setVisualSearchSkus(res?.results.map((f: any) => f.sku));

        autoFocus();
        setSelectedPartsName([]);
        setMachineView('x-ray');
        setPartsView('none');
        setReverseSelectedProduct(undefined);

        setIsFindApiLoading(false);

        if (showFeedback) {
          setShowFeedback(true);
        }
        // go back
        if (firstSearchResults.length === 0 || newSearch) {
          setFirstSearchResults(res?.results);
          setFirstSearchImage(canvasImage);
          setFirstSearchPreFilter(preFilter);
        }
      } catch (error) {
        setIsFindApiLoading(false);
      }

      return res;
    },
    [
      setIsFindApiLoading,
      preFilter,
      setRequestImages,
      setDetectedRegions,
      setRegions,
      metaFilter,
      setFindApiProducts,
      setSessionId,
      setRequestId,
      setAlgoliaFilter,
      setVisualSearchSkus,
      autoFocus,
      setSelectedPartsName,
      setMachineView,
      setPartsView,
      setReverseSelectedProduct,
      firstSearchResults.length,
      refine,
      setShowFeedback,
      setFirstSearchResults,
      setFirstSearchImage,
      setFirstSearchPreFilter,
    ],
  );

  return { singleImageSearch };
};
