import { ImageSearchOptions, urlOrBlobToCanvas } from "@nyris/nyris-api";
import NyrisAPI, { selectFirstCenteredRegion } from "@nyris/nyris-api";

export const serviceImage = async (file: any, settings: any) => {
  try {
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

    console.log("serviceImage regions", regions);
    console.log("serviceImage selection", selection);

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
