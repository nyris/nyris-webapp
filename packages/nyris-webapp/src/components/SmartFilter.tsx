import React, { useMemo } from 'react';
import { Icon } from '@nyris/nyris-react-components';
import useRequestStore from 'stores/request/requestStore';
import useResultStore from 'stores/result/resultStore';
import { rerankSmartFilters, SmartFilterRerankItem } from 'services/vizo';

function SmartFilter({
  imageAnalysis: _imageAnalysis,
  specificationFilter: _specificationFilter,
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
  const isAlgoliaEnabled = !!window.settings?.algolia?.enabled;

  const activeProducts =
    isAlgoliaEnabled && productsFromAlgolia.length > 0
      ? productsFromAlgolia
      : productsFromFindApi;

  const rerankItems: SmartFilterRerankItem[] = useMemo(() => {
    return (activeProducts || [])
      .slice(0, 50)
      .map((product: any): SmartFilterRerankItem | null => {
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
          sku: String(sku),
          imageUrl: String(imageUrl),
          metadata: {
            title: product?.title || product?.name || product?.Bezeichnung || '',
            description:
              product?.description ||
              product?.VK_Text_Englisch ||
              product?.VK_Text_Deutsch ||
              '',
            language: window.settings.language || 'en',
            sku: String(sku),
            score:
              typeof (product?.score ?? product?.similarity) === 'number'
                ? Number(product?.score ?? product?.similarity)
                : null,
          },
        };
      })
      .filter((item): item is SmartFilterRerankItem => item !== null);
  }, [activeProducts]);

  const applySkuOrderingToCurrentResults = (orderedSkus: string[]) => {
    const sourceResults = activeProducts || [];
    const map = new Map<string, any>(
      sourceResults.map((item: any) => [
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
      const nonEmptyFilter: string[] = ['sku:DOES_NOT_EXIST<score=1> '];
      const rankedFilters = orderedSkus
        .slice()
        .reverse()
        .map((sku, i) => `sku:'${sku}'<score=${i}> `);
      setAlgoliaFilter([...nonEmptyFilter, ...rankedFilters].join('OR '));
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
        rerankStatus: 'idle',
        errorMessage: null,
      });
      if (firstSearchResults.length > 0) {
        setFindApiProducts(firstSearchResults);
      }
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
          infoMessage: null,
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
          infoMessage: 'Results were not reranked.',
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
          infoMessage: null,
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
        infoMessage: rerankingApplied ? null : 'Results were not reranked.',
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
      {smartFilters.status === 'loading' && (
        <div className="mx-4 mt-3 text-xs text-[#3E36DC]">
          Loading smart filters...
        </div>
      )}
      {smartFilters.status === 'error' && (
        <div className="mx-4 mt-3 text-xs text-[#D14343]">
          {smartFilters.errorMessage || 'Could not generate smart filters.'}
        </div>
      )}
      {smartFilters.status === 'success' && smartFilters.filters.length === 0 && (
        <div className="mx-4 mt-3 text-xs text-[#767A9F]">
          No smart filters available for this image.
        </div>
      )}
      {smartFilters.infoMessage && (
        <div className="mx-4 mt-3 text-xs text-[#767A9F]">
          {smartFilters.infoMessage}
        </div>
      )}
      {smartFilters.rerankStatus === 'loading' && (
        <div className="mx-4 mt-1 text-xs text-[#3E36DC]">Applying rerank...</div>
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
          return (
            <button
              key={`${filter.key}-${filter.value}-${index}`}
              style={variant === 'results' ? { flex: '0 0 auto' } : undefined}
              className={`px-3.5 py-2 rounded-lg border text-sm ${
                isSelected
                  ? 'bg-[#545987] text-white border-[#545987]'
                  : 'bg-[#E7E8F1] text-[#767A9F] border-transparent'
              }`}
              onClick={() => {
                if (smartFilters.rerankStatus === 'loading') return;
                void onFilterClick({
                  key: filter.key,
                  value: filter.value,
                });
              }}
            >
              {filter.label}: {filter.value}
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}

export default SmartFilter;
