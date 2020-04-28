import {WH} from "@nyris/nyris-api";

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

