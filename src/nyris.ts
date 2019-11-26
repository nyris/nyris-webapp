import loadImage from 'blueimp-load-image';
import {Crop, RectCoords, WH} from "./types";





/**
 * Gets url parameter values by name.
 * @param name The parameter name.
 * @returns string value if it has value assigned with `=`, true if it is specified but without value or `undefined` if not present
 */
export function getUrlParam(name: string): string | boolean | undefined {
    let results = new RegExp(`[?&]${name}(=([^&#]*))?(&|$|#)`, 'i')
        .exec(window.location.href);
    if (results && results[2]) { // has value
        console.log('has value', name, results[2]);
        return decodeURIComponent(results[2]);
    }
    return (results && true) // present but without value
        || undefined; // not present
}

export const rectToCrop = ({x1, x2, y1, y2}: RectCoords): Crop =>
    ({
        x: x1,
        y: y1,
        w: x2-x1,
        h: y2-y1
    });

export function getThumbSizeLongestEdge(maxW: number, maxH: number, iW: number, iH: number): WH {
    let iR = iW / iH;
    let dR = maxW / maxH;
    if (dR > iR) {
        return {
            w: iW * maxH / iH,
            h: maxH
        }
    }
    return {
        w: maxW,
        h: iH * maxW / iW
    }
}

export function getThumbSizeArea(maxWidth: number, maxHeight: number, originalWidth: number, originalHeight: number): WH {
    const targetArea = maxWidth * maxHeight;

    const aspectRatio = originalWidth / originalHeight;
    const width = Math.sqrt(targetArea * aspectRatio);
    return {
        w: width,
        h: width / aspectRatio
    };
}

export function getElementSize(elem: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) {
    const img = elem as HTMLImageElement;
    const video = elem as HTMLVideoElement;
    return [
        img.naturalWidth || video.videoWidth || elem.width,
        img.naturalHeight || video.videoHeight || elem.height
    ];
}

// TODO get rid of crop type
export function toCanvas(elem: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, newSize?: WH, canvas?: HTMLCanvasElement, crop?: Crop): HTMLCanvasElement {
    let [ow, oh] = getElementSize(elem);
    if (!crop) {
        crop = {
            x: 0,
            y: 0,
            w: ow,
            h: oh
        }
    }
    const sx = crop.x;
    const sy = crop.y;
    const sw = crop.w;
    const sh = crop.h;

    const dw = (newSize && newSize.w) || ow;
    const dh = (newSize && newSize.h) || oh;

    if (!canvas)
        canvas = document.createElement('canvas');

    canvas.width = dw;
    canvas.height = dh;
    // @ts-ignore
    canvas.getContext('2d').drawImage(
        elem,
        sx, sy,
        sw, sh,
        0, 0, // dx dy
        dw, dh
    );
    return canvas;
}

export function fileOrBlobToCanvas(file: File | string): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
        // File can also be an image element
        loadImage(file, (data => {
            const c = data as HTMLCanvasElement;
            if (c) {
                resolve(c);
            } else {
                reject();
            }
        }), {
            canvas: true,
            orientation: true
        });
    });
}

export function canvasToJpgBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob)
            } else {
                reject()
            }
        }, 'image/jpeg', quality);
    });
}

