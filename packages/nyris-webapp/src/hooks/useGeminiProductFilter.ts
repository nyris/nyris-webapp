import { useState, useCallback } from 'react';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import Compressor from 'compressorjs';
import useRequestStore from 'stores/request/requestStore';
import useResultStore from 'stores/result/resultStore';

// Initialize the Google Gen AI client once.
// In a secure, client-side React app, the API call should typically
// be proxied through your own secure backend/serverless function
// to prevent exposing the GEMINI_API_KEY. For this hook structure,
// we assume the environment/runtime handles security (e.g., a Next.js API route).

const ai = new GoogleGenAI({
  apiKey: process.env.REACT_APP_GEMINI_API_KEY,
});

async function urlToGenerativePart(url: string, mimeType = 'image/jpeg') {
  const response = await fetch(url);
  const blob = await response.blob();

  // Log original image size
  // console.log('[GeminiFilter] Original image size:', blob.size, 'bytes');

  const compressImage = async (input: Blob): Promise<Blob> => {
    // Defensive: ensure input is a Blob (should always be from fetch)
    if (!(input instanceof Blob)) {
      console.warn(
        'compressImage: input is not a Blob, skipping compression.',
        input,
        url,
      );
      return input;
    }
    const jpegBlob = new Blob([input], { type: 'image/jpeg' });
    return new Promise<Blob>((resolve, reject) => {
      new Compressor(jpegBlob, {
        quality: 0.91,
        maxHeight: 500,
        maxWidth: 500,
        strict: true,
        success: (compressedResult: Blob) => {
          resolve(compressedResult);
        },
        error: err => {
          console.error('Compression error:', err);
          reject(err);
        },
      });
    });
  };

  let processedBlob: Blob = blob;
  try {
    processedBlob = await compressImage(blob);
    // Log compressed image size
    // console.log(
    //   '[GeminiFilter] Compressed image size:',
    //   processedBlob.size,
    //   'bytes',
    // );
  } catch (e) {
    // Fallback to original blob if compression fails
    console.warn('Image compression failed, using original image.', e, url);
  }

  const arrayBuffer = await processedBlob.arrayBuffer();
  // Avoid call stack overflow by processing in chunks
  function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000; // 32kB chunks
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(
        null,
        bytes.subarray(i, i + chunkSize) as any,
      );
    }
    return btoa(binary);
  }
  const base64String = arrayBufferToBase64(arrayBuffer);
  return {
    inlineData: {
      mimeType,
      data: base64String,
    },
    // mediaResolution: {
    //   level: 'media_resolution_low',
    // },
  };
}

/**
 * Custom React hook to filter products using the Gemini API (multimodal).
 * @returns {object} { filteredProducts, isLoading, error, filterProducts }
 */
export const useGeminiProductFilter = () => {
  const [filteredProducts, setFilteredProducts] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const model = 'gemini-flash-lite-latest';

  const visualResultSchema = {
    type: 'object',
    title: 'Text Context Router Schema',
    properties: {
      text_type: {
        type: 'string',
        enum: [
          'product_description',
          'keyword_query',
          'question',
          'clarification',
          'other',
        ],
      },
      is_product_search: {
        type: 'boolean',
        description: 'True if text should trigger a search.',
      },
      extracted_filters: {
        type: ['object', 'null'],
        properties: {
          sku: { type: ['string', 'null'] },
          part_number: { type: ['string', 'null'] },
          brand: { type: ['string', 'null'] },
          model: { type: ['string', 'null'] },
          material: { type: ['string', 'null'] },
          color: { type: ['string', 'null'] },
          shape: { type: ['string', 'null'] },
          dimensions: { type: ['string', 'null'] },
          category: { type: ['string', 'null'] },
          specifications: { type: ['string', 'null'] },
        },
      },
    },
  };

  const visualResults = useCallback(
    async (userText: string, findApiProducts: any, algoliaProducts: any) => {
      setError('');
      const requestImage = useRequestStore.getState().requestImages?.[0];
      const algoliaEnabled = Boolean(window.settings?.algolia?.enabled);
      const productsToUse = algoliaEnabled ? algoliaProducts : findApiProducts;
      if (!productsToUse || productsToUse.length === 0) {
        setError('Product list is empty.');
        return;
      }
      const productList = productsToUse
        .map((p: any, i: any) => buildProductEntry(p, i))
        .join('\n');
      const visualResultPrompt = `
# TASK
You are analyzing text that a user has pasted into the chat assistant.
Determine if this text contains a product description that can be used
to find a specific item.

# CONTEXT PROVIDED
- user_text: The text pasted by the user in the chat.
- request_image: The original image uploaded by the user.
- current_results[0..99]: The existing visual search results.
- conversation_history: Previous messages in this session.

# STEPS
1. Analyze the user text to determine its type.
2. If it is a product description with identifying details, extract filters.
3. Return classification and extracted filters for search.
4. Return only a valid JSON object. No markdown, no code fences.

# TEXT CLASSIFICATION

- product_description: Long text containing specific product details
  (part numbers, SKUs, dimensions, materials, brand names, model numbers,
  technical specifications, physical descriptions).

- keyword_query: Simple short keywords (1-5 words) for search.

- question: User is asking a question (contains ?, starts with
  who/what/where/when/why/how/is/are/can/does).

- clarification: User answering a previous question from the assistant
  ("Yes", "The brass one", "It's for a Kubota tractor").

- other: General text that doesn't fit above categories.

# CLASSIFICATION SIGNALS

product_description indicators:
- Multiple sentences describing an item
- Contains specific identifiers (SKU, part number, model)
- Contains multiple attributes (material + color + size + brand)
- Reads like a catalog entry or spec sheet
- Contains measurements or technical specifications

keyword_query indicators:
- Short (1-5 words)
- No complete sentences
- Generic terms without specific identifiers

question indicators:
- Contains question marks
- Starts with interrogative words

clarification indicators:
- Short response
- References previous context

# EXTRACTION RULES (for product_description only)

- Extract exact values when clearly stated.
- Map to standard filter keys: sku, part_number, brand, model,
  material, color, shape, dimensions, category, specifications.
- Generate a bm25_query combining key identifiers.
- Do not infer values not explicitly stated.

# SEARCH STRATEGY

- search_in_results: First search within existing 100 results.
- search_full_index: If not found, search full index via find API.
- no_search: Text is question/clarification, handle conversationally.`;
      let promptParts = [];

      promptParts.push({ parts: [{ text: visualResultPrompt }] });

      if (requestImage) {
        let requestImageUrl: string | null = null;

        if (typeof requestImage === 'string') {
          requestImageUrl = requestImage;
        } else if (requestImage instanceof HTMLCanvasElement) {
          requestImageUrl = requestImage.toDataURL('image/jpeg');
        } else {
          console.warn(
            'Unsupported request image type for rerank.',
            requestImage,
          );
        }

        if (requestImageUrl) {
          const requestImagePart = await urlToGenerativePart(requestImageUrl);
          promptParts.push({
            parts: [
              {
                text: 'request_image: This is the request image uploaded by the user.',
              },
              {
                text: `user_text: ${userText}`,
              },
              {
                text: `current_results ${productList}`,
              },
              requestImagePart,
            ],
          });
        }
      }

      // Add each product's image (as base64) and its JSON data to the prompt
      for (const algoliaProduct of productsToUse) {
        const content: any = { parts: [] };
        // find the full product details from findApiProducts using sku
        const product = findApiProducts.find(
          (p: any) => p.sku === algoliaProduct.sku,
        );
        if (product) {
          if (product.image || product.matches) {
            // Fetch and encode the image as base64
            try {
              const url = product.matches
                ? product.matches[0]?.url
                : product.image;
              const imagePart = await urlToGenerativePart(url);
              content.parts.push(imagePart);
            } catch (imgErr) {
              console.warn(
                `Failed to fetch image for product sku ${product.sku}:`,
                imgErr,
              );
            }
          } else {
            console.warn(`Product sku ${product.sku} missing image.`);
          }

          // Include the product details (JSON)
          //  but ignore fields image, images, matches to reduce prompt size
          const { image, images, matches, ...productDetails } = product;
          const productTextPart = {
            text: `Product sku: ${product.sku}. Details: ${JSON.stringify(
              productDetails,
            )}`,
          };
          content.parts.push(productTextPart);

          promptParts.push(content);
        }
      }

      try {
        const response = await ai.models.generateContent({
          model,
          contents: promptParts,
          config: {
            responseMimeType: 'application/json',
            responseSchema: visualResultSchema,
          },
        });

        const result = JSON.parse(response.text || '{}');
        // useResultStore.getState().setGoogleGroundingResult(result);
        return result;
      } catch (err) {
        console.error('Gemini API Error:', err);
        setError(
          'Failed to run Google grounding. Please check the network or server logs.',
        );
      } finally {
        // useResultStore.getState().setIsGoogleGroundingLoading(false);
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Build a compact product description including all metadata for LLM comparison.
   * Includes customIds, mpn, brand, title, description — everything useful for matching.
   */
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

  return {
    filteredProducts,
    isLoading,
    error,
    visualResults,
  };
};
