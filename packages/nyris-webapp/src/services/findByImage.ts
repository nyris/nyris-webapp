import NyrisAPI, {ImageSearchOptions, NyrisAPISettings} from "@nyris/nyris-api";

export const findByImage = async (image: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement, options: ImageSearchOptions, settings: NyrisAPISettings) => {
    const api = new NyrisAPI(settings);
    const {
      results,
      duration,
      requestId,
      categoryPredictions,
      codes,
    } = await api.findByImage(image, options);
    return {
      results,
      duration,
      requestId,
      categoryPredictions,
      codes,
    };
};
