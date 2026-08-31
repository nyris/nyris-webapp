interface PostFilterFacetValue {
  value: string;
  count: number;
}

export interface PostFilterFacet {
  name: string;
  values: PostFilterFacetValue[];
}

interface ProductWithFilters {
  filters?: Record<string, unknown>;
}

/**
 * Aggregates post-filter facet options from result.filters when the find API
 * does not return top-level facets (e.g. visual search). Matches the pre-02ede11
 * PostFilterFindApi counting behavior.
 */
export function derivePostFilterFacetsFromResults(
  results: ProductWithFilters[] | undefined | null,
): PostFilterFacet[] {
  if (!results?.length) {
    return [];
  }

  const countsByAttribute: Record<string, Record<string, number>> = {};

  results.forEach(product => {
    const filters = product?.filters;
    if (!filters || typeof filters !== 'object') {
      return;
    }

    Object.entries(filters).forEach(([attribute, filterValues]) => {
      if (!Array.isArray(filterValues)) {
        return;
      }

      if (!countsByAttribute[attribute]) {
        countsByAttribute[attribute] = {};
      }

      filterValues.forEach((val: unknown) => {
        if (typeof val === 'string' && val) {
          countsByAttribute[attribute][val] =
            (countsByAttribute[attribute][val] || 0) + 1;
        }
      });
    });
  });

  return Object.entries(countsByAttribute).map(([name, counts]) => ({
    name,
    values: Object.entries(counts).map(([value, count]) => ({ value, count })),
  }));
}

export function resolvePostFilterFacets(
  apiFacets: unknown,
  results: ProductWithFilters[] | undefined | null,
): PostFilterFacet[] {
  if (Array.isArray(apiFacets) && apiFacets.length > 0) {
    return apiFacets as PostFilterFacet[];
  }

  return derivePostFilterFacetsFromResults(results);
}
