function normalize(value: string): string {
  return value
    ?.toLowerCase() // Step 1
    ?.replace(/[^a-z0-9]/gi, ''); // Step 2
}

function getAllValues(obj: any): any[] {
  const values: any[] = [];

  function extractValues(current: any): void {
    if (Array.isArray(current)) {
      current.forEach(item => extractValues(item));
    } else if (current !== null && typeof current === 'object') {
      Object.values(current).forEach(value => extractValues(value));
    } else {
      values.push(current?.toString()?.toLowerCase());
    }
  }

  extractValues(obj);
  return values;
}

function findBestMatch(
  query: string,
  array: string[],
  threshold = 1,
): string | null {
  const normalizedQuery = normalize(query);

  let bestMatch = null;

  for (const candidate of array) {
    const normalizedCandidate = normalize(candidate);
    // Exact match found
    if (normalizedQuery === normalizedCandidate) {
      return candidate;
    }

    const qureySplits = query?.split(' ');

    if (query && candidate?.length >= 2 && qureySplits?.includes(candidate)) {
      return candidate;
    }

    const candidateSplits = candidate?.split(' ');

    if (query && candidate && candidateSplits?.includes(query)) {
      return candidate;
    }
  }

  return bestMatch;
}

export function filterProducts(search: string, products: any) {
  const searchLower = search?.toLowerCase();

  return products.filter((product: any) => {
    const fieldsToSearch = getAllValues(product);

    return findBestMatch(searchLower, fieldsToSearch);
  });
}
