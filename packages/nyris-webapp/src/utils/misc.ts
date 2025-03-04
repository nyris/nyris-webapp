import {
  RectCoords,
  getElementSize,
  getRectAspectRatio,
  getThumbSizeArea,
  elementToCanvas,
} from '@nyris/nyris-api';

export const groupFiltersByFirstLetter = (filters: string[]) => {
  if (!filters) {
    return {};
  }
  const groupedStrings: { [key: string]: string[] } = {};

  filters
    .sort((a, b) => a.localeCompare(b))
    .forEach(str => {
      const firstLetter = str[0].toUpperCase();
      if (!groupedStrings[firstLetter]) {
        groupedStrings[firstLetter] = [];
      }
      groupedStrings[firstLetter].push(str);
    });

  return groupedStrings;
};

export const getCroppedCanvas = (
  canvas: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement,
  cropRect?: RectCoords,
) => {
  let crop = cropRect || {
    x1: 0,
    x2: 1,
    y1: 0,
    y2: 1,
  };
  if (!canvas) return null;

  const originalSize = getElementSize(canvas);
  const aspectRatio = getRectAspectRatio(crop, originalSize);
  let scaledSize = getThumbSizeArea(600, 600, aspectRatio);
  let resizedCroppedCanvas = elementToCanvas(canvas, scaledSize, crop);
  return resizedCroppedCanvas;
};

export const isHEIC = (file: File) => {
  if (!file) return false;
  if (!file.name) return false;
  // Check extension (case insensitive)
  const ext =
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif');

  // Check MIME type
  const mime =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.type === 'image/heic-sequence';

  return ext || mime;
};
