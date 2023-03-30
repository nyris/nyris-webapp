import NyrisAPI, {
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

  if (region) {
    options = { cropRect: region };
  }
  return nyrisApi.findByImage(image, options, filters);
};

export const findByCadFile = (file: File, settings: NyrisAPISettings) => {
  const nyrisApi = new NyrisAPI(settings);
  return nyrisApi.findByCad(file, {});
};
