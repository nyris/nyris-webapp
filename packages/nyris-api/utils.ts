import loadImage from 'blueimp-load-image';
import {RectCoords, Region, WH} from "./types";


/**
 * Calculates the center of a [[RectCoords]].
 * @param rect The [[RectCoords]] to calculate the center coordinate from.
 */
function rectCenter({x1, x2, y1, y2}: RectCoords) : [number, number] {
    return [ // get middle of box and map to pixels
         ((x2-x1)/2 + x1),
         ((y2-y1)/2+ y1)
    ];
}

/**
 * Calculate distance between two points
 * @param x1 The x coordinate of the first point.
 * @param y1 The y coordinate of the first point.
 * @param x2 The x coordinate of the second point.
 * @param y2 The y coordinate of the second point.
 */
const dist2d = ([x1, y1]: [number, number], [x2, y2]: [number, number] ) : number =>
    Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);


/**
 * Return first `Rect` from list `regions` with center-point which has a maximal distance of `maxDistance` from
 * the center. Otherwise return `defaultRect`
 * @param regions
 * @param maxDistance
 * @param defaultRect
 */
export function selectFirstCenteredRegion(regions: Region[], maxDistance: number, defaultRect: RectCoords) : RectCoords {
    let centeredRegion = regions.filter(r => {
        let dist = dist2d([0.5, 0.5], rectCenter(r.normalizedRect));
        return dist < maxDistance;
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


/**
 * Calculate the size of a thumbnail image while keeping proportions, based on pixel area.
 * This leads to better results in cases, where the aspect ratio is extreme.
 * @param targetWidth The desired width of the image.
 * @param targetHeight The desired height of the image.
 * @param aspectRatio Aspect ratio of the image.
 */
export function getThumbSizeArea(targetWidth: number, targetHeight: number, aspectRatio: number): WH {
    const targetArea = targetWidth * targetHeight;

    const width = Math.sqrt(targetArea * aspectRatio);
    return {
        w: width,
        h: width / aspectRatio
    };
}


/**
 * Calculate the size of a thumbnail image to fit in `maxWith` and `maxHeight` while preserving the aspect ratio.
 * @param maxWidth
 * @param maxHeight
 * @param originalWidth
 * @param originalHeight
 */
export function getThumbSizeLongestEdge(maxWidth: number, maxHeight: number, originalWidth: number, originalHeight: number): WH {
    let iR = originalWidth / originalHeight;
    let dR = maxWidth / maxHeight;
    if (dR > iR) {
        return {
            w: originalWidth * maxHeight / originalHeight,
            h: maxHeight
        }
    }
    return {
        w: maxWidth,
        h: originalHeight * maxWidth / originalWidth
    }
}

export function scaleRect(r: RectCoords, size: WH) : RectCoords {
    return {
        x1: r.x1 * size.w,
        x2: r.x2 * size.w,
        y1: r.y1 * size.h,
        y2: r.y2 * size.h
    }
}

/**
 * Calculates the size of a rect.
 * @param r The [[RectCoords]].
 */
export function getRectSize(r: RectCoords): WH {
    return  {
        w: r.x2-r.x1,
        h: r.y2-r.y1
    };
}

/**
 * Get aspect ratio of a rect
 * @param rect The normalized rect.
 * @param size The original image size.
 */
export function getRectAspectRatio(rect: RectCoords, size: WH) : number {
    const scaledRect = scaleRect(rect, size);
    const {w, h} = getRectSize(scaledRect);
    return w / h;
}

export function getElementSize(elem: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): WH {
    const img = elem as HTMLImageElement;
    const video = elem as HTMLVideoElement;
    return {
        w: img.naturalWidth || video.videoWidth || elem.width,
        h: img.naturalHeight || video.videoHeight || elem.height
    };
}

export function elementToCanvas(elem: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, newSize?: WH, normalizedRect?: RectCoords): HTMLCanvasElement {
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

export function urlOrBlobToCanvas(file: File | string): Promise<HTMLCanvasElement> {
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
            orientation: true,
            crossOrigin: 'anonymous'
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

