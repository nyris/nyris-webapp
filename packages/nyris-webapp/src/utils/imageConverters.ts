import { decode } from 'tiff';

import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';

// @ts-ignore
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs';

GlobalWorkerOptions.workerSrc = new URL(
  pdfjsWorker,
  import.meta.url,
).toString();

export const tiffToJpg = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target?.result) {
        try {
          const tiffArray = new Uint8Array(event.target.result as ArrayBuffer);
          const tiffImages = decode(tiffArray);
          const firstImage = tiffImages[0];
          const { width, height, data } = firstImage;
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          let firstImageData: any = data;

          if (!ctx) {
            reject(new Error('Failed to get canvas context.'));
            return;
          }

          // Convert RGB to RGBA by adding an alpha channel.
          if (data.length === width * height * 3) {
            const fixedData = new Uint8ClampedArray(width * height * 4);
            for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
              fixedData[j] = data[i];
              fixedData[j + 1] = data[i + 1];
              fixedData[j + 2] = data[i + 2];
              fixedData[j + 3] = 255;
            }
            firstImageData = fixedData;
          }

          canvas.width = firstImage.width;
          canvas.height = firstImage.height;

          const imageData = new ImageData(
            new Uint8ClampedArray(firstImageData),
            width,
            height,
          );
          ctx.putImageData(imageData, 0, 0);

          canvas.toBlob(blob => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert TIFF to JPG.'));
            }
          }, 'image/jpeg');
        } catch (error) {
          console.log(error);
          reject(new Error('Error decoding TIFF file.'));
        }
      } else {
        reject(new Error('FileReader failed to load file.'));
      }
    };

    reader.onerror = () => reject(new Error('Error reading TIFF file.'));
    reader.readAsArrayBuffer(file);
  });
};

export const pdfToImage = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      if (!reader.result) {
        reject(new Error('FileReader failed to load file.'));
        return;
      }

      try {
        const loadingTask = pdfjsLib.getDocument(
          new Uint8Array(reader.result as ArrayBuffer),
        );
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const scale = 2;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Failed to get canvas context.'));
          return;
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        canvas.toBlob(blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert PDF to image.'));
          }
        }, 'image/png');
      } catch (error) {
        console.log({ error });
        reject(new Error('Error processing PDF file.'));
      }
    };

    reader.onerror = () => reject(new Error('Error reading PDF file.'));
  });
};
