import {
  RectCoords,
  getElementSize,
  getRectAspectRatio,
  getThumbSizeArea,
  elementToCanvas,
} from '@nyris/nyris-api';

export function cropImage(
  canvas: HTMLCanvasElement,
  region?: RectCoords,
  maxWidth: number = 1024,
  maxHeight: number = 1024,
): HTMLCanvasElement {
  if (!region) return canvas;

  const crop: RectCoords = region || { x1: 0, x2: 1, y1: 0, y2: 1 };
  const originalSize = getElementSize(canvas);
  const aspectRatio = getRectAspectRatio(crop, originalSize);
  const scaledSize = getThumbSizeArea(maxWidth, maxHeight, aspectRatio);
  const croppedCanvas = elementToCanvas(canvas, scaledSize, crop);
  return croppedCanvas;
}

export function canvasToBase64(
  canvas: HTMLCanvasElement,
  type: string = 'image/png',
  quality?: number,
): string {
  const dataUrl = canvas.toDataURL(type, quality);
  return dataUrl.split(',')[1];
}
