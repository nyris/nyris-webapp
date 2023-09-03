import {
  RectCoords,
  getElementSize,
  getRectAspectRatio,
  getThumbSizeArea,
  elementToCanvas,
} from '@nyris/nyris-api';

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
