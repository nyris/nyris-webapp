type ProductLike = Record<string, any>;

type TextSearchFieldScoring =
  | number
  | {
      exactMatch?: number;
      startsWith?: number;
      partial?: number;
      searchable?: boolean;
    };

type TextSearchScoring = Record<string, TextSearchFieldScoring>;

const defaultTextSearchScoring = {
  sku: { exactMatch: 50, startsWith: 30 },
  customIds: { exactMatch: 40, startsWith: 6, partial: 2 },
  title: { exactMatch: 25, partial: 10 },
  brand: { exactMatch: 15, startsWith: 6, partial: 2 },
  otherFields: { exactMatch: 8, startsWith: 6, partial: 2 },
};

const getTextSearchScoring = (): TextSearchScoring => {
  if (
    typeof window !== 'undefined' &&
    window.settings &&
    window.settings.textSearchScoring
  ) {
    return window.settings.textSearchScoring;
  }
  return defaultTextSearchScoring;
};

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

const collectValuesWithExclusions = (
  value: any,
  excludedPaths: string[],
): string[] => {
  if (!excludedPaths.length) return collectValues(value);

  const values: string[] = [];
  const excludedSet = new Set(excludedPaths);

  const addValue = (item: any, path: string): void => {
    if (!item) return;
    if (excludedSet.has(path)) return;

    if (Array.isArray(item)) {
      item.forEach((entry, index) => addValue(entry, `${path}.${index}`));
      return;
    }
    if (typeof item === 'object') {
      Object.entries(item).forEach(([key, entry]) =>
        addValue(entry, path ? `${path}.${key}` : key),
      );
      return;
    }
    values.push(String(item));
  };

  addValue(value, '');
  return values;
};

const getValueByPath = (target: any, path: string): any => {
  if (!path) return undefined;
  const parts = path.split('.').filter(Boolean);
  let current = target;
  for (const part of parts) {
    if (!current || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return current;
};

const isSearchableFalse = (fieldScoring: TextSearchFieldScoring): boolean =>
  typeof fieldScoring === 'object' && fieldScoring?.searchable === false;

const collectOtherFieldValues = (
  product: ProductLike,
  scoring: TextSearchScoring,
): string[] => {
  const excludedKeys = new Set<string>(['otherFields']);

  Object.keys(scoring).forEach(key => {
    const topLevelKey = key.split('.')[0];
    if (topLevelKey) excludedKeys.add(topLevelKey);
  });
  const values: string[] = [];

  Object.entries(product || {}).forEach(([key, value]) => {
    if (excludedKeys.has(key)) return;
    values.push(...collectValues(value));
  });

  return values;
};

const scoreFieldValues = (
  values: string[],
  normalizedQuery: string,
  fieldScoring: TextSearchFieldScoring,
): number => {
  if (!values.length) return 0;

  let score = 0;
  for (const value of values) {
    const normalizedValue = normalizeText(value);
    if (!normalizedValue) continue;

    if (typeof fieldScoring === 'number') {
      if (normalizedValue === normalizedQuery) score += fieldScoring;
      continue;
    }

    if (normalizedValue === normalizedQuery) {
      score += fieldScoring?.exactMatch ?? 0;
    } else if (normalizedValue.startsWith(normalizedQuery)) {
      score += fieldScoring?.startsWith ?? 0;
    } else if (normalizedValue.includes(normalizedQuery)) {
      score += fieldScoring?.partial ?? 0;
    }
  }

  return score;
};

export const filterProductsByText = (
  query: string,
  products: ProductLike[],
): ProductLike[] => {
  // Algorithm: score by field-specific weights with exact/prefix/substring
  // matching. Stable ordering is preserved for ties.
  if (!query?.trim()) return products;

  const scoring = getTextSearchScoring();

  const normalizedQuery = normalizeText(query);
  const ranked = products
    .map((product, index) => {
      const fieldValues: Record<string, string[]> = {
        sku: collectValues(product?.sku),
        title: collectValues(product?.title),
        brand: collectValues(product?.brand),
        customIds: collectValues(product?.customIds).concat(
          collectValues(product?.ids),
        ),
        otherFields: collectOtherFieldValues(product, scoring),
      };

      let score = 0;

      for (const [key, fieldScoring] of Object.entries(scoring)) {
        if (isSearchableFalse(fieldScoring)) {
          continue;
        }

        const excludedNestedPaths = Object.entries(scoring)
          .filter(
            ([scoringKey, scoringValue]) =>
              scoringKey.startsWith(`${key}.`) &&
              isSearchableFalse(scoringValue),
          )
          .map(([scoringKey]) => scoringKey.slice(key.length + 1));

        const sourceValue = getValueByPath(product, key) ?? product?.[key];
        const values = excludedNestedPaths.length
          ? collectValuesWithExclusions(sourceValue, excludedNestedPaths)
          : (fieldValues[key] ?? collectValues(sourceValue));
        score += scoreFieldValues(values, normalizedQuery, fieldScoring);
      }

      return { product, score, index };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  return ranked.map(item => item.product);
};
