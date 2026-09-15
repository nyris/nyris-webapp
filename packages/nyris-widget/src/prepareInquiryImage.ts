export const MAX_INQUIRY_IMAGE_BYTES = 1.5 * 1024 * 1024;
export const JPEG_QUALITY = 0.9;
export const MAX_DOWNSCALE_ITERATIONS = 10;

const JPEG_MIME = 'image/jpeg';
const DOWNSCALE_MARGIN = 0.9;

function copyToOffscreenCanvas(
  source: HTMLCanvasElement,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2d canvas context');
  }
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

function nextDimension(current: number, scale: number): number {
  return Math.max(1, Math.min(current - 1, Math.floor(current * scale)));
}

export function prepareInquiryImage(source: HTMLCanvasElement): string {
  if (source.width === 0 || source.height === 0) {
    throw new Error('Inquiry image canvas has no dimensions');
  }

  let width = source.width;
  let height = source.height;
  let canvas = copyToOffscreenCanvas(source, width, height);
  let dataUrl = canvas.toDataURL(JPEG_MIME, JPEG_QUALITY);

  for (
    let iteration = 0;
    iteration < MAX_DOWNSCALE_ITERATIONS && dataUrl.length > MAX_INQUIRY_IMAGE_BYTES;
    iteration += 1
  ) {
    const scale =
      Math.min(Math.sqrt(MAX_INQUIRY_IMAGE_BYTES / dataUrl.length), 1) * DOWNSCALE_MARGIN;
    const nextWidth = nextDimension(width, scale);
    const nextHeight = nextDimension(height, scale);

    if (nextWidth === width && nextHeight === height) {
      throw new Error('Inquiry image could not be reduced under the EmailJS size limit');
    }

    width = nextWidth;
    height = nextHeight;
    canvas = copyToOffscreenCanvas(source, width, height);
    dataUrl = canvas.toDataURL(JPEG_MIME, JPEG_QUALITY);
  }

  if (dataUrl.length > MAX_INQUIRY_IMAGE_BYTES) {
    throw new Error('Inquiry image could not be reduced under the EmailJS size limit');
  }

  return dataUrl;
}
