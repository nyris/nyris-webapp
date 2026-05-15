import { useMemo } from 'react';
import useRequestStore from 'stores/request/requestStore';
import useResultStore from 'stores/result/resultStore';
import { filterProductsByText } from 'utils/textSearchFilter';

export function useEffectiveGroundingResults() {
  const productsFromFindApi = useResultStore(
    state => state.productsFromFindApi,
  );
  const groundingFilterResult = useResultStore(
    state => state.groundingFilterResult,
  );
  const query = useRequestStore(state => state.query);
  const requestImages = useRequestStore(state => state.requestImages);
  const postFilterSelections = useRequestStore(
    state => state.postFilterSelections,
  );

  const effectiveGroundingResults = useMemo(() => {
    let filteredProducts = productsFromFindApi;

    if (requestImages?.length && query?.trim()) {
      filteredProducts = filterProductsByText(query, productsFromFindApi);
    }

    const postEntries = Object.entries(postFilterSelections || {}).filter(
      ([, values]) => values?.length,
    );
    if (postEntries.length > 0) {
      filteredProducts = filteredProducts.filter((product: any) => {
        const productFilters = product?.filters || {};
        return postEntries.every(([attribute, selectedValues]) => {
          const productValues = productFilters?.[attribute];
          if (!Array.isArray(productValues)) return false;
          return selectedValues.some((value: string) =>
            productValues.includes(value),
          );
        });
      });
    }

    return groundingFilterResult.filter((result: any) =>
      filteredProducts.some((product: any) => product.sku === result.sku),
    );
  }, [
    productsFromFindApi,
    groundingFilterResult,
    query,
    requestImages,
    postFilterSelections,
  ]);

  return effectiveGroundingResults;
}
