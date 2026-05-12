/**
 * Utility functions for fetching and processing product images.
 * Handles resizing to 256px max, CORS, timeouts, and error handling.
 */

/**
 * Fetch a product image URL and return base64-encoded JPEG (resized to 256px max).
 * Returns null on any failure (CORS, 404, timeout, etc.)
 */
export async function fetchProductImageBase64(
  imageUrl: string,
): Promise<string | null> {
  try {
    const trimmedUrl = imageUrl?.trim();
    if (!trimmedUrl) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout per image

    const fetchAsBlob = async (url: string): Promise<Blob> => {
      const response = await fetch(url, {
        signal: controller.signal,
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response.blob();
    };

    try {
      // Direct fetch from source URL only.
      const blob = await fetchAsBlob(trimmedUrl);

      const objectUrl = URL.createObjectURL(blob);

      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          try {
            const maxSize = 256; // Small thumbnails to keep request size reasonable
            const scale = Math.min(
              1,
              maxSize / Math.max(img.width, img.height),
            );
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              URL.revokeObjectURL(objectUrl);
              resolve(null);
              return;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
            const b64 = dataUrl.split(',')[1] || '';
            URL.revokeObjectURL(objectUrl);
            resolve(b64 || null);
          } catch (canvasErr) {
            console.warn(
              '[fetchProductImage] Canvas toDataURL failed:',
              trimmedUrl,
              canvasErr,
            );
            URL.revokeObjectURL(objectUrl);
            resolve(null);
          }
        };
        img.onerror = () => {
          console.warn(
            '[fetchProductImage] Image element load failed:',
            trimmedUrl,
          );
          URL.revokeObjectURL(objectUrl);
          resolve(null);
        };
        // Blob URL is same-origin — no CORS taint, canvas read will succeed
        img.src = objectUrl;
      });
    } catch (fetchErr: any) {
      const reason = fetchErr?.message || String(fetchErr);
      console.warn(
        `[fetchProductImage] Direct image fetch failed: ${trimmedUrl} | ${reason}`,
      );
      return null;
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    console.warn('[fetchProductImage] Image processing error:', imageUrl, err);
    return null;
  }
}

/**
 * Get the best available image URL for a product.
 */
export function getProductImageUrl(product: any): string | null {
  return (
    product.matches?.[0]?.url ||
    product.main_image_link ||
    product.image ||
    product.images?.[0] ||
    null
  );
}
