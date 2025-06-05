import { useCallback } from 'react';
import { RectCoords } from '@nyris/nyris-api';
import { isEmpty, isUndefined } from 'lodash';

import { decode } from 'tiff';
import { createImage, find, findRegions } from 'services/visualSearch';

import useResultStore from 'stores/result/resultStore';
import useRequestStore from 'stores/request/requestStore';

import { AppSettings } from 'types';
import { compressImage } from 'utils/compressImage';
import useUiStore from 'stores/ui/uiStore';
import { useClearRefinements } from 'react-instantsearch';
import { isHEIC } from 'utils/misc';

import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';

// @ts-ignore
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs';

GlobalWorkerOptions.workerSrc = new URL(
  pdfjsWorker,
  import.meta.url,
).toString();

export const useImageSearch = () => {
  const setRegions = useRequestStore(state => state.setRegions);
  const query = useRequestStore(state => state.query);

  const setRequestImages = useRequestStore(state => state.setRequestImages);
  const setSpecificationFilter = useRequestStore(
    state => state.setSpecificationFilter,
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

  const tiffToJpg = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (event.target?.result) {
          try {
            const tiffArray = new Uint8Array(
              event.target.result as ArrayBuffer,
            );
            const tiffImages = decode(tiffArray);
            const firstImage = tiffImages[0];
            const { width, height, data } = firstImage;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let firstImageData: any = data;

            if (!ctx) {
              reject(new Error('Failed to get canvas context.'));
              return;
            }
            // Convert RGB to RGBA by adding an alpha channel
            if (data.length === width * height * 3) {
              const fixedData = new Uint8ClampedArray(width * height * 4);
              for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
                fixedData[j] = data[i];
                fixedData[j + 1] = data[i + 1];
                fixedData[j + 2] = data[i + 2];
                fixedData[j + 3] = 255;
              }
              firstImageData = fixedData;
            }

            canvas.width = firstImage.width;
            canvas.height = firstImage.height;

            const imageData = new ImageData(
              new Uint8ClampedArray(firstImageData),
              width,
              height,
            );
            ctx.putImageData(imageData, 0, 0);

            canvas.toBlob(blob => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to convert TIFF to JPG.'));
              }
            }, 'image/jpeg');
          } catch (error) {
            console.log(error);
            reject(new Error('Error decoding TIFF file.'));
          }
        } else {
          reject(new Error('FileReader failed to load file.'));
        }
      };

      reader.onerror = () => reject(new Error('Error reading TIFF file.'));
      reader.readAsArrayBuffer(file);
    });
  };

  const pdfToImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async () => {
        if (!reader.result) {
          reject(new Error('FileReader failed to load file.'));
          return;
        }

        try {
          const loadingTask = pdfjsLib.getDocument(
            new Uint8Array(reader.result as ArrayBuffer),
          );
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1); // Get first page

          const scale = 2; // Adjust for better resolution
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) {
            reject(new Error('Failed to get canvas context.'));
            return;
          }

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context, viewport }).promise;

          canvas.toBlob(blob => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert PDF to image.'));
            }
          }, 'image/png');
        } catch (error) {
          console.log({ error });

          reject(new Error('Error processing PDF file.'));
        }
      };

      reader.onerror = () => reject(new Error('Error reading PDF file.'));
    });
  };

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
          text: !window.settings.algolia.enabled
            ? isUndefined(text)
              ? query
              : text
            : undefined,
        });

        if (clearPostFilter) {
          refine();
        }

        setFindApiProducts(res?.results);
        setImageAnalysis(res?.image_analysis);
        setSessionId(res?.session);
        setRequestId(res?.id);

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
      setRequestImages,
      setSpecificationFilter,
      setDetectedRegions,
      setRegions,
      metaFilter,
      setFindApiProducts,
      setImageAnalysis,
      setSessionId,
      setRequestId,
      setAlgoliaFilter,
      firstSearchResults.length,
      refine,
      setShowFeedback,
      setFirstSearchResults,
      setFirstSearchImage,
      setFirstSearchPreFilter,
      setFirstRequestImageAnalysis,
      query,
    ],
  );

  return { singleImageSearch };
};
