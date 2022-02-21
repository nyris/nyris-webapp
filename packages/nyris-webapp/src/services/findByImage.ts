import NyrisAPI from "@nyris/nyris-api";

export const findByImage = async (image: any, options: any, settings: any) => {
  try {
    const api = new NyrisAPI(settings);
    const { results, duration, requestId, categoryPredictions, codes } =
      await api.findByImage(image, options);
    return {
      results,
      duration,
      requestId,
      categoryPredictions,
      codes,
    };
  } catch (error) {
    console.log("error findByImage", error);
  }
};
