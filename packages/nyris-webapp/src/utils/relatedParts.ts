// ── Related-parts lookup table (cached after first fetch) ──
interface RelatedPartEntry {
  keywords: string[];
  relatedParts: { label: string; description: string }[];
}
type RelatedPartsTable = Record<string, RelatedPartEntry[]>;
let relatedPartsCache: RelatedPartsTable | null = null;

export async function loadRelatedPartsTable(): Promise<RelatedPartsTable> {
  if (relatedPartsCache) return relatedPartsCache;
  try {
    const res = await fetch('/data/related-parts.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    relatedPartsCache = await res.json();
    return relatedPartsCache!;
  } catch (err) {
    console.warn('[RelatedParts] Failed to load lookup table:', err);
    return {};
  }
}

export function lookupRelatedParts(
  table: RelatedPartsTable,
  productDescription: string,
): { label: string; description: string }[] | null {
  const entries = table['GC Gruppe'];
  if (!entries) return null;
  const desc = productDescription.toLowerCase();
  for (const entry of entries) {
    if (entry.keywords.some(kw => desc.includes(kw.toLowerCase()))) {
      return entry.relatedParts;
    }
  }
  return null;
}
