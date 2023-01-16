import NyrisAPI, {
  NyrisAPISettings,
  RectCoords,
  selectFirstCenteredRegion,
  urlOrBlobToCanvas,
} from '@nyris/nyris-api';
import { isEqual } from 'lodash';
export interface Filter {
  key?: string;
  values: string[];
}
export const defaultRect = { x1: 0, x2: 1, y1: 0, y2: 1 };

export const createImage = async (
  fileOrUrl: File | string | HTMLCanvasElement,
) => {
  const image =
    fileOrUrl instanceof HTMLCanvasElement
      ? fileOrUrl
      : await urlOrBlobToCanvas(fileOrUrl);
  return image;
};

export const findRegions = async (
  image: HTMLCanvasElement,
  settings: NyrisAPISettings,
) => {
  const nyrisApi = new NyrisAPI(settings);
  let regions = await nyrisApi.findRegions(image);
  const selectedRegion = selectFirstCenteredRegion(regions, 0.3, defaultRect);
  return {
    selectedRegion: isEqual(selectedRegion, defaultRect)
      ? undefined
      : selectedRegion,
    regions,
  };
};

export const findByImage = ({
  image,
  settings,
  region,
  filters,
}: {
  image: HTMLCanvasElement;
  settings: NyrisAPISettings;
  region?: RectCoords;
  filters?: Filter[];
}) => {
  const nyrisApi = new NyrisAPI(settings);
  let options = {};
  console.log({ filters });

  if (region) {
    options = { cropRect: region };
  }
  return nyrisApi.findByImage(image, options, filters);
};

export const findByCadFile = (file: File, settings: NyrisAPISettings) => {
  const nyrisApi = new NyrisAPI(settings);
  return nyrisApi.findByCad(file, {});
};
