import {
  ImageSearchOptions,
  NyrisAPISettings,
  RectCoords,
  selectFirstCenteredRegion,
  urlOrBlobToCanvas
} from "@nyris/nyris-api";
import NyrisAPI from "@nyris/nyris-api";
import {RootState} from "../Store/Store";

export const serviceImage = async (canvas: HTMLCanvasElement, settings: NyrisAPISettings) => {
  const nyrisApi = new NyrisAPI(settings);

  const regions = await nyrisApi.findRegions(canvas);
  const searchRegion = selectFirstCenteredRegion(regions, 0.3, {x1: 0, x2: 1, y1: 0, y2: 1});

  let options : ImageSearchOptions = {
    ...settings,
    cropRect: searchRegion
  };

  const { results, requestId, duration, categoryPredictions, codes } =
    await nyrisApi.findByImage(canvas, options);
  const payload = {
    results,
    requestId,
    categoryPredictions,
    codes,
    duration,
    regions,
    selectedRegion: searchRegion
  };

  return payload;
};

export const serviceImageNonRegion = async (
  canvas: HTMLCanvasElement,
  stateStore: RootState,
  rectCoords?: RectCoords
) => {
  const { settings } = stateStore;
  const api = new NyrisAPI(settings);
  let options: ImageSearchOptions = {
    cropRect: rectCoords,
  };
  const { results, duration, requestId, categoryPredictions, codes } =
    await api.findByImage(canvas, options);
  return {
    results,
    requestId,
    duration,
    categoryPredictions,
    codes,
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

export const createImage = async (fileOrUrl: File|string|HTMLCanvasElement) => {
  const image = fileOrUrl instanceof HTMLCanvasElement ? fileOrUrl : await urlOrBlobToCanvas(fileOrUrl);
  return image;
}

export const findRegions = (image: HTMLCanvasElement, settings: NyrisAPISettings) => {
  const nyrisApi = new NyrisAPI(settings);
  return nyrisApi.findRegions(image);
};

export const findByImage = (image: HTMLCanvasElement, settings: NyrisAPISettings, region?: RectCoords) => {
  const nyrisApi = new NyrisAPI(settings);
  let options = {};
  if (region) {
    options = { cropRect: region };
  }
  return nyrisApi.findByImage(image, options);

};
