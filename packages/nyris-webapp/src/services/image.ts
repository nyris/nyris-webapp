import { ImageSearchOptions, urlOrBlobToCanvas } from "@nyris/nyris-api";
import NyrisAPI, { selectFirstCenteredRegion } from "@nyris/nyris-api";

export const serviceImage = async (file: any, stateStore: any) => {
  try {
    const { settings } = stateStore;
    const api = new NyrisAPI(settings);
    const image = await urlOrBlobToCanvas(file);
    const randomId = Math.random().toString();
    const imageFileCanvas = { canvas: image, id: randomId };

    const regions = await api.findRegions(image).then((res) => res);

    let selection = selectFirstCenteredRegion(regions, 0.3, {
      x1: 0,
      x2: 1,
      y1: 0,
      y2: 1,
    });

    let options: ImageSearchOptions = {
      cropRect: selection,
    };
    const { results, duration, requestId, categoryPredictions, codes } =
      await api.findByImage(image, options);
    const payload = {
      results,
      requestId,
      categoryPredictions,
      codes,
      duration,
      regions,
      selectedRegion: selection,
      requestImage: imageFileCanvas,
    };
    return payload;
  } catch (error) {
    console.log("error serviceImage", error);
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
