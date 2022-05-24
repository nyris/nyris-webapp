import {
  ImageSearchOptions,
  NyrisAPISettings,
  RectCoords,
  selectFirstCenteredRegion,
  urlOrBlobToCanvas
} from "@nyris/nyris-api";
import NyrisAPI from "@nyris/nyris-api";
import {RootState} from "../Store/Store";

export const serviceImage = async (file: File|string, settings: NyrisAPISettings) => {
  const nyrisApi = new NyrisAPI(settings);
  const randomId = Math.random().toString();

  const image = await urlOrBlobToCanvas(file);
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
};

export const serviceImageNonRegion = async (
  file: File | string | HTMLCanvasElement,
  stateStore: RootState,
  rectCoords?: RectCoords
) => {
  const { settings } = stateStore;
  const api = new NyrisAPI(settings);
  const image = file instanceof HTMLCanvasElement ? file : await urlOrBlobToCanvas(file);
  const randomId = Math.random().toString();
  const imageFileCanvas = { canvas: image, id: randomId };
  let options: ImageSearchOptions = {
    cropRect: rectCoords,
  };
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
};

export const searchImageByPosition = async (
  image: HTMLCanvasElement,
  settings: NyrisAPISettings,
  region?: RectCoords
) => {
  const nyrisApi = new NyrisAPI(settings);
  let options = {};
  if (region) {
    options = {
      cropRect: region,
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
};
