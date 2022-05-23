import {ImageSearchOptions, NyrisAPISettings, selectFirstCenteredRegion, urlOrBlobToCanvas} from "@nyris/nyris-api";
import NyrisAPI from "@nyris/nyris-api";
import { fileOrBlobToCanvas, rectToCrop } from "./nyris";

export const serviceImage = async (file: any, settings: NyrisAPISettings) => {
  try {
    const nyrisApi = new NyrisAPI(settings);
    const randomId = Math.random().toString();

    const image = await fileOrBlobToCanvas(file);
    const imageFileCanvas = { canvas: image, id: randomId };

    const regions = await nyrisApi.findRegions(image);
    const searchRegion = selectFirstCenteredRegion(regions, 0.3, {x1: 0, x2: 1, y1: 0, y2: 1});

    let options : ImageSearchOptions = {
      ...settings,
      cropRect: searchRegion
    };

    const { results, requestId, duration, categoryPredictions, codes } =
      await nyrisApi.findByImage(image, options);
    const payload = {
      results,
      requestId,
      categoryPredictions,
      codes,
      duration,
      regions,
      requestImage: imageFileCanvas,
      selectedRegion: searchRegion
    };

    return payload;
  } catch (error) {
    console.log("error serviceImage", error);
    return;
  }
};

export const serviceImageNonRegion = async (
  file: any,
  stateStore: any,
  rectCoords: any
) => {
  const { settings } = stateStore;
  const api = new NyrisAPI(settings);
  const image = await urlOrBlobToCanvas(file);
  const randomId = Math.random().toString();
  const imageFileCanvas = { canvas: image, id: randomId };
  let options: ImageSearchOptions = {
    cropRect: rectCoords,
  };
  try {
    const { results, duration, requestId, categoryPredictions, codes } =
      await api.findByImage(image, options);
    return {
      results,
      requestId,
      duration,
      categoryPredictions,
      codes,
      requestImage: imageFileCanvas,
    };
  } catch (e) {
    console.warn("search failed serviceImageNonRegion", e);
  }
};

export const searchImageByPosition = async (
  image: HTMLCanvasElement,
  stateStore: any,
  region?: any
) => {
  try {
    const { settings } = stateStore;

    let options = settings;
    const nyrisApi = new NyrisAPI(settings);
    if (region) {
      let { x1, x2, y1, y2 } = region;
      let crop = rectToCrop({
        x1: x1 * image.width,
        x2: x2 * image.width,
        y1: y1 * image.height,
        y2: y2 * image.height,
      });
      options = {
        ...options,
        crop,
      };
    }
    const { results, duration, requestId, categoryPredictions, codes } =
      await nyrisApi.findByImage(image, options);
    const payload = {
      results,
      requestId,
      categoryPredictions,
      codes,
      duration,
      regions: region,
    };
    return payload;
  } catch (error) {
    console.log("error searchImageByPosition", error);
  }
};
