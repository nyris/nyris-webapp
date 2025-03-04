import Compressor from 'compressorjs';

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
