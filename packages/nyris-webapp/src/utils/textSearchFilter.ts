type ProductLike = Record<string, any>;

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const collectValues = (value: any): string[] => {
  const values: string[] = [];

  const addValue = (item: any): void => {
    if (!item) return;
    if (Array.isArray(item)) {
      item.forEach(entry => addValue(entry));
      return;
    }
    if (typeof item === 'object') {
      Object.values(item).forEach(entry => addValue(entry));
      return;
    }
    values.push(String(item));
  };

  addValue(value);
  return values;
};

const collectOtherFieldValues = (product: ProductLike): string[] => {
  const excludedKeys = new Set(['title', 'brand', 'sku', 'ids', 'customIds']);
  const values: string[] = [];

  Object.entries(product || {}).forEach(([key, value]) => {
    if (excludedKeys.has(key)) return;
    values.push(...collectValues(value));
  });

  return values;
};

export const filterProductsByText = (
  query: string,
  products: ProductLike[],
): ProductLike[] => {
  // Algorithm: score by field-specific weights with exact/prefix/substring
  // matching. Stable ordering is preserved for ties.
  if (!query?.trim()) return products;

  const normalizedQuery = normalizeText(query);
  const ranked = products
    .map((product, index) => {
      const title = normalizeText(product?.title || '');
      const brand = normalizeText(product?.brand || '');
      const sku = normalizeText(product?.sku || '');
      const customIdValues = collectValues(product?.customIds).concat(
        collectValues(product?.ids),
      );
      const otherFieldValues = collectOtherFieldValues(product);

      let score = 0;

      if (sku) {
        if (sku === normalizedQuery) {
          score += 50;
        } else if (sku.startsWith(normalizedQuery)) {
          score += 30;
        }
      }

      if (customIdValues.length > 0) {
        const normalizedCustomIds = customIdValues.map(value =>
          normalizeText(value),
        );
        if (normalizedCustomIds.some(value => value === normalizedQuery)) {
          score += 40;
        } else if (
          normalizedCustomIds.some(value => value.startsWith(normalizedQuery))
        ) {
          score += 6;
        } else if (
          normalizedCustomIds.some(value => value.includes(normalizedQuery))
        ) {
          score += 2;
        }
      }

      if (title) {
        if (title === normalizedQuery) {
          score += 25;
        } else if (title.includes(normalizedQuery)) {
          score += 10;
        }
      }

      if (brand) {
        if (brand === normalizedQuery) {
          score += 15;
        } else if (brand.startsWith(normalizedQuery)) {
          score += 6;
        } else if (brand.includes(normalizedQuery)) {
          score += 2;
        }
      }

      for (const value of otherFieldValues) {
        const field = normalizeText(value);
        if (!field) continue;

        if (field === normalizedQuery) {
          score += 8;
        } else if (field.startsWith(normalizedQuery)) {
          score += 6;
        } else if (field.includes(normalizedQuery)) {
          score += 2;
        }
      }

      return { product, score, index };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  return ranked.map(item => item.product);
};
