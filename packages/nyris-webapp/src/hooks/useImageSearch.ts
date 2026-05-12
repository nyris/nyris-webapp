import { useCallback } from 'react';
import { RectCoords } from '@nyris/nyris-api';
import { isEmpty, isUndefined } from 'lodash';

import { createImage, find, findRegions } from 'services/visualSearch';

import useResultStore from 'stores/result/resultStore';
import useRequestStore from 'stores/request/requestStore';

import { AppSettings } from 'types';
import { compressImage } from 'utils/compressImage';
import { pdfToImage, tiffToJpg } from 'utils/imageConverters';
import useUiStore from 'stores/ui/uiStore';
import { useClearRefinements } from 'react-instantsearch';
import { isHEIC } from 'utils/misc';

import useResultEvaluator from './useResultEvaluator';
import useConversationStore from 'stores/chat/conversationStore';
import { useGroundedSearch } from './useGroundedSearch';

export const useImageSearch = () => {
  const setRegions = useRequestStore(state => state.setRegions);
  const query = useRequestStore(state => state.query);

  const setRequestImages = useRequestStore(state => state.setRequestImages);
  const setSpecificationFilter = useRequestStore(
    state => state.setSpecificationFilter,
  );
  const clearPostFilterSelections = useRequestStore(
    state => state.clearPostFilterSelections,
  );

  const setAlgoliaFilter = useRequestStore(state => state.setAlgoliaFilter);
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
  const setFirstRequestImageAnalysis = useResultStore(
    state => state.setFirstRequestImageAnalysis,
  );

  const setFindApiProducts = useResultStore(state => state.setFindApiProducts);
  const setImageAnalysis = useResultStore(state => state.setImageAnalysis);

  const setSessionId = useResultStore(state => state.setSessionId);
  const setRequestId = useResultStore(state => state.setRequestId);
  const firstSearchResults = useResultStore(state => state.firstSearchResults);
  const setFirstSearchResults = useResultStore(
    state => state.setFirstSearchResults,
  );

  const { refine } = useClearRefinements();
  const { evaluateResults } = useResultEvaluator();
  const { groundedSearch } = useGroundedSearch();
  const startNewSession = useConversationStore(s => s.startNewSession);

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
      text,
    }: {
      image?: any;
      settings: AppSettings;
      showFeedback?: boolean;
      imageRegion?: RectCoords;
      newSearch?: boolean;
      compress?: boolean;
      preFilterParams?: Record<string, boolean>;
      clearPostFilter?: boolean;
      text?: string;
    }) => {
      setIsFindApiLoading(true);
      // setAlgoliaProducts([]);
      useRequestStore.getState().setGroundingQuery('');

      useUiStore.getState().resetBanner();
      startNewSession();

      let region: RectCoords | undefined = imageRegion;
      let res: any;
      let compressedBase64;
      let blob = image;
      let requestImage: HTMLCanvasElement | undefined;
      let canvasImage: any;

      if (image) {
        if (image.type === 'application/pdf') {
          blob = await pdfToImage(image);
        }

        if (isHEIC(image)) {
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

        if (image.type === 'image/tiff' && image.name.endsWith('.tiff')) {
          blob = await tiffToJpg(image);
        }

        if (compress) {
          try {
            compressedBase64 = await compressImage(blob);
          } catch (error) {}
        }

        canvasImage = await createImage(compressedBase64 || blob);

        requestImage = await createImage(blob);

        if (!imageRegion) {
          setRequestImages([canvasImage]);
          setSpecificationFilter({});
        }

        if (!imageRegion) {
          try {
            let res = await findRegions(requestImage, settings);
            setDetectedRegions(res.regions, 0);
            region = res.selectedRegion;
            setRegions([region]);
          } catch (error) {}
        }
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
          text:
            !window.settings.algolia.enabled && !requestImage
              ? isUndefined(text)
                ? query
                : text
              : undefined,
        });
        useResultStore.getState().resetGrounding();
        if (clearPostFilter) {
          refine();
          clearPostFilterSelections();
        }

        setFindApiProducts(res?.results);
        setImageAnalysis(res?.image_analysis);
        setSessionId(res?.session);
        setRequestId(res?.id);

        const specification = res?.image_analysis?.specification || {};
        const hasOcr = Object.keys(specification).length > 0;

        if (
          hasOcr &&
          window.settings.vizo?.groundingEnabled &&
          res?.results.length > 0
        ) {
          groundedSearch(
            requestImage || canvasImage,
            res?.results || [],
            region,
          );
        }
        if (window.settings.vizo.chat) {
          evaluateResults({
            activeProducts: res?.results || [],
            imageAnalysis: res?.image_analysis,
          });
        }
        const nonEmptyFilter: any[] = ['sku:DOES_NOT_EXIST<score=1> '];
        const filterSkus: any = res?.results
          ? res?.results
              .slice()
              .reverse()
              .map((f: any, i: number) => `sku:'${f.sku}'<score=${i}> `)
          : '';
        const filterSkusString = [...nonEmptyFilter, ...filterSkus].join('OR ');

        setAlgoliaFilter(filterSkusString);
        setIsFindApiLoading(false);

        if (showFeedback) {
          setShowFeedback(true);
        }

        // setGroundingError(null);
        // go back
        if (firstSearchResults.length === 0 || newSearch) {
          setFirstSearchResults(res?.results);
          setFirstSearchImage(canvasImage);
          setFirstSearchPreFilter(preFilter);
          setFirstRequestImageAnalysis(res?.image_analysis);
        }
      } catch (error) {
        setIsFindApiLoading(false);
      }

      return res;
    },
    [
      setIsFindApiLoading,
      preFilter,
      startNewSession,
      setRequestImages,
      setSpecificationFilter,
      setDetectedRegions,
      setRegions,
      metaFilter,
      query,
      setFindApiProducts,
      setImageAnalysis,
      setSessionId,
      setRequestId,
      setAlgoliaFilter,
      firstSearchResults.length,
      refine,
      clearPostFilterSelections,
      groundedSearch,
      evaluateResults,
      setShowFeedback,
      setFirstSearchResults,
      setFirstSearchImage,
      setFirstSearchPreFilter,
      setFirstRequestImageAnalysis,
    ],
  );

  return { singleImageSearch };
};
