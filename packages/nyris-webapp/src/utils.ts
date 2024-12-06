import Compressor from 'compressorjs';

import { WH } from '@nyris/nyris-api';

/**
 * Gets url parameter values by name.
 * @param name The parameter name.
 * @returns string value if it has value assigned with `=`, true if it is specified but without value or `undefined` if not present
 */
export function getUrlParam(name: string): string | boolean | undefined {
  let results = new RegExp(`[?&]${name}(=([^&#]*))?(&|$|#)`, 'i').exec(
    window.location.href,
  );
  if (results && results[2]) {
    // has value
    return decodeURIComponent(results[2]);
  }
  return (
    (results && true) || // present but without value
    undefined
  ); // not present
}

export function getThumbSizeLongestEdge(
  maxW: number,
  maxH: number,
  iW: number,
  iH: number,
): WH {
  let iR = iW / iH;
  let dR = maxW / maxH;
  if (dR > iR) {
    return {
      w: (iW * maxH) / iH,
      h: maxH,
    };
  }
  return {
    w: maxW,
    h: (iH * maxW) / iW,
  };
}

export const compressImage = async (input: string | Blob): Promise<string> => {
  let blob: Blob;

  if (typeof input === 'string') {
    if (input.startsWith('https:')) {
      // Fetch the image from the URL and convert it to a Blob
      const response = await fetch(input);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      blob = await response.blob();
    } else {
      // Convert base64 string to Blob
      const byteString = atob(input.split(',')[1]);
      const mimeString = input.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      blob = new Blob([ab], { type: mimeString });
    }
  } else {
    blob = input;
  }

  return new Promise<string>((resolve, reject) => {
    new Compressor(blob, {
      quality: 0.91,
      maxHeight: 1024,
      maxWidth: 1024,
      strict: true,
      success: compressedResult => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            resolve(reader.result as string);
          } else {
            reject(new Error('Failed to read compressed image data.'));
          }
        };
        reader.onerror = () => {
          reject(new Error('Error reading compressed image data.'));
        };
        reader.readAsDataURL(compressedResult);
      },
      error: err => {
        console.error('Compression error:', err);
        reject(err);
      },
    });
  });
};
