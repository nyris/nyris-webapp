import loadImage from 'blueimp-load-image';
import {Crop, Region, Rect} from "./types";

interface Box {
    x: number,
    y: number,
    w: number,
    h: number,
    x2: number,
    y2: number
}

interface WH {
    w: number,
    h: number
}



// get url parameter value by name
// returns:
//   * string value if it has value assigned with `=`
//   * true if it is specified but without value
//   * false if not present
export function getUrlParam(name: string): string | boolean {
    let results = new RegExp(`[?&]${name}(=([^&#]*))?(&|$|#)`, 'i')
        .exec(window.location.href);
    if (results && results[2]) { // has value
        console.log('has value', name, results[2]);
        return decodeURIComponent(results[2]);
    }
    return (results && true) // present but without value
        || false; // not present
}


export function regionToBox(region: Region): Box {
    return {
        x: region.left,
        y: region.top,
        w: region.right - region.left,
        h: region.bottom - region.top,
        x2: region.right,
        y2: region.bottom
    };
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

export function getCenterCrop(element: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, borderRatio: number): Crop {
    const [w, h] = getElementSize(element);
    const [bw, bh] = [w * borderRatio, h * borderRatio];
    return {
        x: bw,
        y: bh,
        w: w - (2*bw),
        h: h - (2*bh)
    };
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

export function rectToCrop(s: Rect): Crop {
    return {
        x: s.x,
        y: s.y,
        w: s.x2 - s.x,
        h: s.y2 - s.y
    };
}

export function cropToRect(s: Crop): Rect {
    return {
        x: s.x,
        y: s.y,
        x2: s.w + s.x,
        y2: s.h + s.y
    };
}

export function scaleCrop(r: number, c: Crop): Crop {
    return {
        x: r * c.x,
        y: r * c.y,
        w: r * c.w,
        h: r * c.h,
    };
}

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

/*
export function fileToDataUrl(file: File): Promise<string> {
    return new Promise(resolve => {
        let r = new FileReader();
        r.onload = _ => resolve(r.result);
        r.readAsDataURL(file);
    });
}
*/

export function fileOrImgToCanvas(file: File | HTMLImageElement | string): Promise<HTMLCanvasElement> {
    return new Promise(resolve => {
        // File can also be an image element
        // @ts-ignore
        loadImage(file, resolve, {
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

