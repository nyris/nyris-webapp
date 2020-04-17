import loadImage from 'blueimp-load-image';
import {RectCoords, Region, WH} from "./types";



function rectCenter({x1, x2, y1, y2}: RectCoords) : [number, number] {
    return [ // get middle of box and map to pixels
         ((x2-x1)/2 + x1),
         ((y2-y1)/2+ y1)
    ];
}

const dist2d = ([x1, y1]: [number, number], [x2, y2]: [number, number] ) : number =>
    Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);



export function selectFirstCenteredRegion(regions: Region[], defaultRect: RectCoords) : RectCoords {
    let centeredRegion = regions.filter(r => {
        let dist = dist2d([0.5, 0.5], rectCenter(r.normalizedRect));
        return dist < 0.3;
    });
    if (centeredRegion.length === 0) {
        return defaultRect;
    }
    return centeredRegion[0].normalizedRect;
}

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

export function getThumbSizeArea(maxWidth: number, maxHeight: number, aspectRatio: number): WH {
    const targetArea = maxWidth * maxHeight;

    const width = Math.sqrt(targetArea * aspectRatio);
    return {
        w: width,
        h: width / aspectRatio
    };
}

export function calculateCropAspectRatio({x1, x2, y1, y2}: RectCoords, {w, h}: WH) : number {
    const cropW = x2 - x1;
    const cropH = y2 - y1;
    return (cropW * w) / (cropH * h);
}

export function getElementSize(elem: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): WH {
    const img = elem as HTMLImageElement;
    const video = elem as HTMLVideoElement;
    return {
        w: img.naturalWidth || video.videoWidth || elem.width,
        h: img.naturalHeight || video.videoHeight || elem.height
    };
}

export function toCanvas(elem: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, newSize?: WH, normalizedRect?: RectCoords): HTMLCanvasElement {
    const {w: ow, h: oh} = getElementSize(elem);
    const { x1, x2, y1, y2 } = normalizedRect ? normalizedRect : {
        x1: 0,
        x2: 1,
        y1: 0,
        y2: 1
    };
    const w = x2-x1;
    const h = y2-y1;

    // scale to absolute pixels
    const sx = ow * x1;
    const sw = ow * w;
    const sy = oh * y1;
    const sh = oh * h;

    const dw = (newSize && newSize.w) || ow;
    const dh = (newSize && newSize.h) || oh;

    const canvas = document.createElement('canvas');
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

