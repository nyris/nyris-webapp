import React, { useMemo } from 'react';
import ItemSpecification from './ItemSpecification';
import { Icon } from '@nyris/nyris-react-components';
import useRequestStore from 'stores/request/requestStore';
import useResultStore from 'stores/result/resultStore';
import useUiStore from 'stores/ui/uiStore';
import { rerankSmartFilters, SmartFilterRerankItem } from 'services/vizo';

function SmartFilter({
  imageAnalysis,
  specificationFilter,
  variant = 'results',
}: {
  imageAnalysis?: any;
  specificationFilter?: any;
  variant?: 'sidepanel' | 'results';
}) {
  const settings = window.settings;
  const isSmartFiltersEnabled = !!settings.useSmartFilters;
  const smartFilters = useResultStore(state => state.smartFilters);
  const setSmartFilters = useResultStore(state => state.setSmartFilters);
  const productsFromFindApi = useResultStore(state => state.productsFromFindApi);
  const productsFromAlgolia = useResultStore(state => state.productsFromAlgolia);
  const firstSearchResults = useResultStore(state => state.firstSearchResults);
  const setFindApiProducts = useResultStore(state => state.setFindApiProducts);
  const setAlgoliaProducts = useResultStore(state => state.setAlgoliaProducts);
  const requestImages = useRequestStore(state => state.requestImages);
  const setAlgoliaFilter = useRequestStore(state => state.setAlgoliaFilter);
  const setIsFindApiLoading = useUiStore(state => state.setIsFindApiLoading);
  const isAlgoliaEnabled = !!window.settings?.algolia?.enabled;

  const activeProducts =
    isAlgoliaEnabled && productsFromAlgolia.length > 0
      ? productsFromAlgolia
      : productsFromFindApi;

  // Always rerank against the original, unfiltered result set. Reranking
  // mutates `productsFromFindApi`/`productsFromAlgolia`, so deriving items
  // from those would shrink the payload on every subsequent rerank.
  const originalResults = useMemo(
    () =>
      firstSearchResults && firstSearchResults.length > 0
        ? firstSearchResults
        : activeProducts || [],
    [firstSearchResults, activeProducts],
  );

  const rerankItems: any[] = useMemo(() => {
    return originalResults
      .map((product: any): any | null => {
        const sku = product?.sku || product?.objectID;
        const imageUrl =
          product?.matches?.[0]?.url ||
          product?.['image(main_similarity)'] ||
          product?.main_image_link ||
          product?.image ||
          product?.images?.[0];

        if (!sku || !imageUrl) {
          return null;
        }

        return {
          ...product,
          imageUrl: String(imageUrl),
        };
      })
      .filter((item): item is SmartFilterRerankItem => item !== null);
  }, [originalResults]);

  const buildAlgoliaSkuFilter = (skus: string[]) => {
    const nonEmptyFilter: string[] = ['sku:DOES_NOT_EXIST<score=1> '];
    const rankedFilters = skus
      .slice()
      .reverse()
      .map((sku, i) => `sku:'${sku}'<score=${i}> `);
    return [...nonEmptyFilter, ...rankedFilters].join('OR ');
  };

  const restoreOriginalResults = () => {
    if (originalResults.length === 0) {
      return;
    }
    setFindApiProducts(originalResults);
    if (isAlgoliaEnabled) {
      setAlgoliaProducts(originalResults);
      const skus = originalResults
        .map((p: any) => String(p?.sku || p?.objectID || '').trim())
        .filter(Boolean);
      setAlgoliaFilter(buildAlgoliaSkuFilter(skus));
    }
  };

  const applySkuOrderingToCurrentResults = (orderedSkus: string[]) => {
    const map = new Map<string, any>(
      originalResults.map((item: any) => [
        String(item?.sku || item?.objectID || '').trim(),
        item,
      ]),
    );

    const reordered = orderedSkus
      .map(sku => map.get(String(sku).trim()))
      .filter(Boolean);

    if (reordered.length === 0) {
      return false;
    }

    setFindApiProducts(reordered);
    if (isAlgoliaEnabled) {
      setAlgoliaProducts(reordered);
      setAlgoliaFilter(buildAlgoliaSkuFilter(orderedSkus));
    }
    return true;
  };

  const onFilterClick = async (filter: { key: string; value: string }) => {
    if (!isSmartFiltersEnabled) {
      return;
    }
    if (
      smartFilters.selectedFilterKey === filter.key &&
      smartFilters.selectedFilterValue === filter.value
    ) {
      setSmartFilters({
        ...smartFilters,
        selectedFilterKey: null,
        selectedFilterValue: null,
        rerankedSkus: [],
        rerankStatus: 'idle',
        errorMessage: null,
      });
      restoreOriginalResults();
      return;
    }

    if (!requestImages[0] || rerankItems.length === 0) {
      setSmartFilters({
        ...smartFilters,
        selectedFilterKey: filter.key,
        selectedFilterValue: filter.value,
        rerankStatus: 'error',
        errorMessage: 'Smart filters are unavailable right now.',
      });
      return;
    }

    setSmartFilters({
      ...smartFilters,
      selectedFilterKey: filter.key,
      selectedFilterValue: filter.value,
      rerankStatus: 'loading',
      errorMessage: null,
    });
    setIsFindApiLoading(true);

    try {
      const rerankResponse = await rerankSmartFilters({
        image: requestImages[0],
        payload: {
          filters: { [filter.key]: filter.value },
          items: rerankItems,
        },
      });

      const rerankedSkus = (rerankResponse?.filtered_items || []).map(item =>
        String(item.sku),
      );
      const rerankingApplied =
        (rerankResponse?.reranked as boolean | undefined) ??
        rerankResponse?.rerankingApplied ??
        (rerankedSkus.length > 0 ? true : false);

      if (!Array.isArray(rerankResponse?.filtered_items)) {
        setSmartFilters({
          ...smartFilters,
          selectedFilterKey: filter.key,
          selectedFilterValue: filter.value,
          rerankStatus: 'error',
          errorMessage: 'Could not rerank results.',
        });
        return;
      }

      if (!rerankingApplied) {
        setSmartFilters({
          ...smartFilters,
          selectedFilterKey: filter.key,
          selectedFilterValue: filter.value,
          rerankStatus: 'success',
          errorMessage: null,
        });
        return;
      }

      if (rerankedSkus.length === 0 || !applySkuOrderingToCurrentResults(rerankedSkus)) {
        setSmartFilters({
          ...smartFilters,
          selectedFilterKey: filter.key,
          selectedFilterValue: filter.value,
          rerankStatus: 'error',
          errorMessage: 'Could not rerank results.',
        });
        return;
      }

      setSmartFilters({
        ...smartFilters,
        selectedFilterKey: filter.key,
        selectedFilterValue: filter.value,
        rerankedSkus,
        rerankStatus: 'success',
        errorMessage: null,
      });
    } catch (error: any) {
      const timeout = String(error?.message || '').includes('SMART_FILTER_TIMEOUT');
      setSmartFilters({
        ...smartFilters,
        selectedFilterKey: filter.key,
        selectedFilterValue: filter.value,
        rerankStatus: 'error',
        errorMessage: timeout
          ? 'Smart filters are unavailable right now.'
          : 'Could not rerank results.',
      });
    } finally {
      setIsFindApiLoading(false);
    }
  };

  if (!isSmartFiltersEnabled) {
    return null;
  }

  return (
    <div>
      <div className="flex gap-2 ml-[30px]">
        <div className="text-[#3B3E5F] font-bold text-sm">
          Smart generated filters
        </div>
        <Icon name="smart_filter_indication" className="mt-1" />
      </div>
      <div className={`flex flex-wrap mx-4 gap-2 ${imageAnalysis?.specification ? 'mt-4' : ''}`}>
        {Object.keys(imageAnalysis?.specification || {})
          .filter(key => key !== 'is_nameplate' && key !== 'prefilter_value')
          .map(key => {
            const value = imageAnalysis?.specification[key];
            if (!value) {
              return null;
            }
            return (
              <ItemSpecification
                key={key}
                attr={key}
                value={value}
                specificationFilter={specificationFilter}
                imageAnalysis={imageAnalysis}
              />
            );
          })}
      </div>
      {smartFilters.status === 'loading' && (
        <div className="ml-[30px] mt-3 text-xs text-[#3E36DC]">
          Loading smart filters...
        </div>
      )}
      {smartFilters.status === 'error' && (
        <div className="ml-[30px] mt-3 text-xs text-[#D14343]">
          {smartFilters.errorMessage || 'Could not generate smart filters.'}
        </div>
      )}
      {smartFilters.status === 'success' && smartFilters.filters.length === 0 && (
        <div className="ml-[30px] mt-3 text-xs text-[#767A9F]">
          No smart filters available for this image.
        </div>
      )}
      <div
        className={
          variant === 'results'
            ? 'smartFilters--results mx-4 mt-4 overflow-x-auto overflow-y-hidden'
            : 'smartFilters--sidepanel mx-4 mt-4'
        }
        style={
          variant === 'results'
            ? {
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                scrollBehavior: 'smooth',
              }
            : undefined
        }
      >
        <div
          className={
            variant === 'results'
              ? 'flex flex-row flex-nowrap gap-2 pb-1'
              : 'flex flex-row flex-wrap gap-2 pb-1'
          }
          style={variant === 'results' ? { width: 'max-content' } : { width: 'auto' }}
        >
        {smartFilters.filters.map((filter, index) => {
          const isSelected =
            smartFilters.selectedFilterKey === filter.key &&
            smartFilters.selectedFilterValue === filter.value;
          const hasSelection =
            !!smartFilters.selectedFilterKey &&
            !!smartFilters.selectedFilterValue;
          const isRerankLoading = smartFilters.rerankStatus === 'loading';
          const isDisabled = !isSelected && (hasSelection || isRerankLoading);
          return (
            <button
              key={`${filter.key}-${filter.value}-${index}`}
              type="button"
              disabled={isDisabled}
              aria-pressed={isSelected}
              style={variant === 'results' ? { flex: '0 0 auto' } : undefined}
              className={`px-3.5 py-2 rounded-lg border text-sm inline-flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#545987] text-white border-[#545987]'
                  : 'bg-[#E7E8F1] text-[#767A9F] border-transparent'
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => {
                if (isRerankLoading) return;
                void onFilterClick({
                  key: filter.key,
                  value: filter.value,
                });
              }}
            >
              <span>{filter.value}</span>
              {isSelected && (
                <Icon
                  name="close"
                  className="w-3 h-3 text-white"
                />
              )}
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}

export default SmartFilter;
