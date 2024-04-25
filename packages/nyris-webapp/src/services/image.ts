import NyrisAPI, {
  ImageSearchOptions,
  NyrisAPISettings,
  RectCoords,
  Region,
  urlOrBlobToCanvas,
} from '@nyris/nyris-api';
import { isEqual } from 'lodash';
import { DEFAULT_REGION } from '../constants';
export interface Filter {
  key?: string;
  values: string[];
}

export const createImage = async (
  fileOrUrl: File | string | HTMLCanvasElement,
) => {
  const image =
    fileOrUrl instanceof HTMLCanvasElement
      ? fileOrUrl
      : await urlOrBlobToCanvas(fileOrUrl);
  return image;
};

const getRegionByMaxConfidence = (regions: Region[]) => {
  if (regions.length === 0) {
    return DEFAULT_REGION;
  }
  const regionWithMaxConfidence = regions.reduce((prev, current) => {
    prev.confidence = prev.confidence || 0;
    current.confidence = current.confidence || 0;
    return prev.confidence >= current.confidence ? prev : current;
  });
  return regionWithMaxConfidence.normalizedRect;
};

export const findRegions = async (
  image: HTMLCanvasElement,
  settings: NyrisAPISettings,
) => {
  const nyrisApi = new NyrisAPI(settings);
  let regions = await nyrisApi.findRegions(image);
  const selectedRegion = getRegionByMaxConfidence(regions);
  return {
    selectedRegion: isEqual(selectedRegion, DEFAULT_REGION)
      ? DEFAULT_REGION
      : selectedRegion,
    regions,
  };
};

export const find = ({
  image,
  settings,
  region,
  filters,
  text,
}: {
  image?: HTMLCanvasElement;
  settings: NyrisAPISettings;
  region?: RectCoords;
  filters?: Filter[];
  text?: string;
}) => {
  const nyrisApi = new NyrisAPI(settings);
  let options: ImageSearchOptions = text ? { text } : {};

  if (region) {
    options = { ...options, cropRect: region };
  }
  return nyrisApi.find(options, image, filters);
};
