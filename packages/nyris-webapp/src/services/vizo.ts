import { RectCoords } from '@nyris/nyris-api';
import axios from 'axios';
import { cropImage } from 'utils/cropImageToBase64';
// Utility: Convert HTMLCanvasElement to Blob
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = 'image/jpeg',
  quality = 0.95,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas toBlob failed'));
        }
      },
      type,
      quality,
    );
  });
}

function buildProductEntry(p: any, index: number): string {
  const title = p.Bezeichnung || p.title || p.name || '';
  const desc =
    p.VK_Text_Englisch ||
    p.VK_Text_Deutsch ||
    p.description ||
    p.description_short ||
    '';
  const sku = p.sku || '';
  const brand = p.brand || '';

  // Include customIds metadata
  const customIds = p.customIds || {};
  const mpn = customIds.mpn || customIds.mpn_original || p.mpn || '';
  const normalizedPN =
    customIds['normalized PN'] || customIds['normalized_PN'] || '';
  const normalizedModel =
    customIds['normalized model'] || customIds['normalized_model'] || '';
  const gtin = customIds.gtin || '';

  const idParts: string[] = [];
  if (mpn) idParts.push(`MPN: ${mpn}`);
  if (normalizedPN && normalizedPN !== mpn)
    idParts.push(`NormalizedPN: ${normalizedPN}`);
  if (normalizedModel && normalizedModel !== normalizedPN)
    idParts.push(`Model: ${normalizedModel}`);
  if (gtin) idParts.push(`GTIN: ${gtin}`);

  const idStr = idParts.length > 0 ? ` | IDs: ${idParts.join(', ')}` : '';

  return `[${index}] SKU: ${sku} | Brand: ${brand} | ${title} | ${desc}${idStr}`;
}

/**
 * Calls the nyris grounded search API with a File or HTMLCanvasElement.
 * @param imageInput File or HTMLCanvasElement
 * @param apiKey nyris API key
 */
export async function groundedSearch(
  imageInput: File | HTMLCanvasElement,
  region?: RectCoords,
): Promise<any> {
  const formData = new FormData();
  let imageBlobOrFile: File | Blob;

  if (imageInput instanceof HTMLCanvasElement) {
    const croppedCanvas = cropImage(imageInput, region);
    imageBlobOrFile = await canvasToBlob(croppedCanvas);
    formData.append('image', imageBlobOrFile, 'canvas.jpg');
  } else {
    formData.append('image', imageInput);
  }
  try {
    const response = await axios.post(
      'https://api.nyris.io/api/ai-analysis/grounded-search',
      formData,
      {
        headers: {
          'x-api-key': window.settings.aiApiKey || '',
          // Let axios set Content-Type with boundary automatically
        },
      },
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(`API error: ${error.response.statusText}`);
    } else {
      throw new Error(`API error: ${error.message}`);
    }
  }
}

export async function groundedSearchFilter({
  products,
  groundingSummary,
  apiKey,
}: {
  products: any[];
  groundingSummary: string;
  apiKey: string;
}): Promise<any> {
  const productList = products
    .map((p, i) => buildProductEntry(p, i))
    .join('\n');

  try {
    const response = await axios.post(
      'https://api.nyris.io/api/ai-analysis/filtering-items',
      {
        itemsDataSummary: productList,
        groundingSummary,
      },
      {
        headers: {
          'x-api-key': apiKey || window.settings.aiApiKey || '',
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(`API error: ${error.response.statusText}`);
    } else {
      throw new Error(`API error: ${error.message}`);
    }
  }
}

export async function groundingSearchQuery({
  groundingSummary,
  apiKey,
}: {
  groundingSummary: string;
  apiKey: string;
}): Promise<any> {
  try {
    const response = await axios.post(
      'https://api.nyris.io/api/ai-analysis/search-query',
      {
        groundingSummary,
      },
      {
        headers: {
          'x-api-key': apiKey || window.settings.aiApiKey || '',
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(`API error: ${error.response.statusText}`);
    } else {
      throw new Error(`API error: ${error.message}`);
    }
  }
}
