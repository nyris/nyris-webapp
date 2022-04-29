import loadImage from "blueimp-load-image";
import { Crop, WH } from "./types";

export function getElementSize(
  elem: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
) {
  const img = elem as HTMLImageElement;
  const video = elem as HTMLVideoElement;
  return [
    img.naturalWidth || video.videoWidth || elem.width,
    img.naturalHeight || video.videoHeight || elem.height,
  ];
}

export function getThumbSizeArea(
  maxWidth: number,
  maxHeight: number,
  originalWidth: number,
  originalHeight: number
): WH {
  const targetArea = maxWidth * maxHeight;

  const aspectRatio = originalWidth / originalHeight;
  const width = Math.sqrt(targetArea * aspectRatio);
  return {
    w: width,
    h: width / aspectRatio,
  };
}

// TODO get rid of crop type
export function toCanvas(
  elem: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
  newSize?: WH,
  canvas?: HTMLCanvasElement,
  crop?: Crop
): HTMLCanvasElement {
  let [ow, oh] = getElementSize(elem);
  if (!crop) {
    crop = {
      x: 0,
      y: 0,
      w: ow,
      h: oh,
    };
  }
  const sx = crop.x;
  const sy = crop.y;
  const sw = crop.w;
  const sh = crop.h;

  const dw = (newSize && newSize.w) || ow;
  const dh = (newSize && newSize.h) || oh;

  if (!canvas) canvas = document.createElement("canvas");

  canvas.width = dw;
  canvas.height = dh;
  // @ts-ignore
  canvas.getContext("2d").drawImage(
    elem,
    sx,
    sy,
    sw,
    sh,
    0,
    0, // dx dy
    dw,
    dh
  );
  return canvas;
}

export function canvasToJpgBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject();
        }
      },
      "image/jpeg",
      quality
    );
  });
}

export const rectToCrop = ({ x1, x2, y1, y2 }: any): Crop => ({
  x: x1,
  y: y1,
  w: x2 - x1,
  h: y2 - y1,
});

export function fileOrBlobToCanvas(
  file: File | string
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    // File can also be an image element
    loadImage(
      file,
      (data) => {
        const c = data as HTMLCanvasElement;
        if (c) {
          resolve(c);
        } else {
          reject();
        }
      },
      {
        canvas: true,
        orientation: true,
        crossOrigin: "anonymous",
      }
    );
    
  });
}
