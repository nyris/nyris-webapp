import { urlOrBlobToCanvas } from "@nyris/nyris-api";

export const createImage = async (
  fileOrUrl: File | string | HTMLCanvasElement
) => {
  const image =
    fileOrUrl instanceof HTMLCanvasElement
      ? fileOrUrl
      : await urlOrBlobToCanvas(fileOrUrl);
  return image;
};
