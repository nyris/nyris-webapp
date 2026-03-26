/**
 * Probe a nyris API key to discover the product schema.
 *
 * Makes a minimal search request with a tiny test image,
 * inspects the response fields, and returns the best attribute
 * mappings for product cards + settings overrides.
 */

/**
 * Create a tiny test image blob using canvas (guaranteed valid).
 */
function createTinyImageBlob(): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d');
    if (!ctx) { reject(new Error('No canvas context')); return; }
    // Draw a simple colored square so it's not just white
    ctx.fillStyle = '#888888';
    ctx.fillRect(0, 0, 10, 10);
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
      'image/jpeg',
      0.8
    );
  });
}

/** Known structural fields to skip (not useful for product card display) */
const SKIP_FIELDS = new Set([
  'oid', 'score', 'images', 'image', 'matches', 'filters', 'keywords',
  'links', 'position', 'title', 'description', 'language', 'sku',
  'customIds', 'ids',
]);

/** Priority order for choosing which fields to display on product cards */
const FIELD_PRIORITY: string[] = [
  'brand', 'mpn', 'gtin', 'categoryGroup', 'series',
  'category1', 'category2', 'brandCode', 'model', 'type',
  'material', 'color', 'voltage', 'dimensions', 'size',
  'manufacturer', 'product_line',
];

/** Human-readable labels for known field names */
const FIELD_LABELS: Record<string, string> = {
  brand: 'Brand',
  mpn: 'MPN',
  gtin: 'GTIN',
  categoryGroup: 'Category',
  series: 'Series',
  category1: 'Category',
  category2: 'Subcategory',
  brandCode: 'Brand Code',
  model: 'Model',
  type: 'Type',
  material: 'Material',
  color: 'Color',
  voltage: 'Voltage',
  dimensions: 'Dimensions',
  size: 'Size',
  manufacturer: 'Manufacturer',
  product_line: 'Product Line',
  mpn_original: 'MPN Original',
  gtin_upc: 'UPC',
};

export interface ProbeResult {
  success: boolean;
  error?: string;
  /** Total results returned */
  resultCount: number;
  /** All discovered fields with their source path (e.g. "ids.brand") */
  availableFields: { path: string; label: string; sampleValue: string | null }[];
  /** Best 4 fields for product card attributes */
  recommendedAttributes: {
    attributeOneLabelValue: string;
    attributeOneValue: string;
    attributeTwoLabelValue: string;
    attributeTwoValue: string;
    attributeThreeLabelValue: string;
    attributeThreeValue: string;
    attributeFourLabelValue: string;
    attributeFourValue: string;
    productAttributes: true;
  };
  /** Detected top-level brand field value (for filter key) */
  hasBrandField: boolean;
}

/**
 * Makes a probe search request to discover the product schema for a given API key.
 */
export async function probeApiSchema(apiKey: string): Promise<ProbeResult> {
  const baseUrl = (window as any).settings?.baseUrl || 'https://api.nyris.io';

  try {
    // Generate a valid test image via canvas
    const blob = await createTinyImageBlob();
    console.log('[Probe] Created test image blob:', blob.size, 'bytes');

    const formData = new FormData();
    formData.append('image', blob, 'probe.jpg');

    const url = `${baseUrl}/find/v1.1`;
    console.log('[Probe] Sending probe to:', url, 'with key:', apiKey.substring(0, 8) + '...');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/offers.complete+json',
        'X-Options': 'limit=5',
      },
      body: formData,
    });

    console.log('[Probe] Response status:', response.status, response.statusText);

    if (!response.ok) {
      return { success: false, error: `API returned ${response.status}: ${response.statusText}`, resultCount: 0, availableFields: [], recommendedAttributes: emptyAttributes(), hasBrandField: false };
    }

    const data = await response.json();
    const results = data?.results || [];

    if (results.length === 0) {
      return { success: false, error: 'No results returned — index may be empty', resultCount: 0, availableFields: [], recommendedAttributes: emptyAttributes(), hasBrandField: false };
    }

    // Analyze field structure across all returned results
    const fieldValues: Record<string, (string | null)[]> = {};

    for (const result of results) {
      // Top-level fields
      for (const [key, value] of Object.entries(result)) {
        if (SKIP_FIELDS.has(key)) continue;
        if (typeof value === 'string' || value === null) {
          if (!fieldValues[key]) fieldValues[key] = [];
          fieldValues[key].push(value as string | null);
        }
      }

      // ids.* fields (preferred — these are the standard accessor paths)
      if (result.ids && typeof result.ids === 'object') {
        for (const [key, value] of Object.entries(result.ids)) {
          const path = `ids.${key}`;
          if (typeof value === 'string' || value === null) {
            if (!fieldValues[path]) fieldValues[path] = [];
            fieldValues[path].push(value as string | null);
          }
        }
      }

      // customIds.* fields (fallback)
      if (result.customIds && typeof result.customIds === 'object') {
        for (const [key, value] of Object.entries(result.customIds)) {
          const path = `customIds.${key}`;
          if (!fieldValues[path]) fieldValues[path] = [];
          if (typeof value === 'string' || value === null) {
            fieldValues[path].push(value as string | null);
          }
        }
      }
    }

    // Score each field: prefer fields that have non-null values across results
    const scoredFields: { path: string; fieldName: string; score: number; sampleValue: string | null }[] = [];

    for (const [path, values] of Object.entries(fieldValues)) {
      const nonNullValues = values.filter(v => v !== null && v !== '' && v !== 'null');
      const fieldName = path.includes('.') ? path.split('.').pop()! : path;

      // Skip structural fields in ids/customIds
      if (['hasPartsListEntries'].includes(fieldName)) continue;

      const priorityIndex = FIELD_PRIORITY.indexOf(fieldName);
      const priorityScore = priorityIndex >= 0 ? (FIELD_PRIORITY.length - priorityIndex) * 10 : 0;
      const coverageScore = (nonNullValues.length / values.length) * 50;
      // Prefer ids.* paths over top-level (more specific accessor)
      const pathBonus = path.startsWith('ids.') ? 5 : path.startsWith('customIds.') ? 2 : 3;

      scoredFields.push({
        path,
        fieldName,
        score: priorityScore + coverageScore + pathBonus,
        sampleValue: nonNullValues[0] || null,
      });
    }

    // Sort by score descending
    scoredFields.sort((a, b) => b.score - a.score);

    // Deduplicate by fieldName (prefer ids.* path)
    const seenFieldNames = new Set<string>();
    const deduped = scoredFields.filter(f => {
      if (seenFieldNames.has(f.fieldName)) return false;
      seenFieldNames.add(f.fieldName);
      return true;
    });

    // Pick top 4 for attributes
    const top4 = deduped.slice(0, 4);

    const availableFields = deduped.map(f => ({
      path: f.path,
      label: FIELD_LABELS[f.fieldName] || f.fieldName,
      sampleValue: f.sampleValue,
    }));

    const attrs = emptyAttributes();
    if (top4[0]) { attrs.attributeOneLabelValue = FIELD_LABELS[top4[0].fieldName] || top4[0].fieldName; attrs.attributeOneValue = top4[0].path; }
    if (top4[1]) { attrs.attributeTwoLabelValue = FIELD_LABELS[top4[1].fieldName] || top4[1].fieldName; attrs.attributeTwoValue = top4[1].path; }
    if (top4[2]) { attrs.attributeThreeLabelValue = FIELD_LABELS[top4[2].fieldName] || top4[2].fieldName; attrs.attributeThreeValue = top4[2].path; }
    if (top4[3]) { attrs.attributeFourLabelValue = FIELD_LABELS[top4[3].fieldName] || top4[3].fieldName; attrs.attributeFourValue = top4[3].path; }

    const hasBrandField = results.some((r: any) => r.brand && typeof r.brand === 'string');

    return {
      success: true,
      resultCount: results.length,
      availableFields,
      recommendedAttributes: attrs,
      hasBrandField,
    };
  } catch (err: any) {
    console.error('[Probe] Error:', err);
    return { success: false, error: err.message || 'Network error', resultCount: 0, availableFields: [], recommendedAttributes: emptyAttributes(), hasBrandField: false };
  }
}

function emptyAttributes() {
  return {
    productAttributes: true as const,
    attributeOneLabelValue: '',
    attributeOneValue: '',
    attributeTwoLabelValue: '',
    attributeTwoValue: '',
    attributeThreeLabelValue: '',
    attributeThreeValue: '',
    attributeFourLabelValue: '',
    attributeFourValue: '',
  };
}
