import React, { useMemo } from 'react';
import { Icon } from '@nyris/nyris-react-components';
import useRequestStore from 'stores/request/requestStore';
import useResultStore from 'stores/result/resultStore';
import { rerankSmartFilters, SmartFilterRerankItem } from 'services/vizo';

function SmartFilter({
  imageAnalysis: _imageAnalysis,
  specificationFilter: _specificationFilter,
}: {
  imageAnalysis?: any;
  specificationFilter?: any;
}) {
  const smartFilters = useResultStore(state => state.smartFilters);
  const setSmartFilters = useResultStore(state => state.setSmartFilters);
  const productsFromFindApi = useResultStore(state => state.productsFromFindApi);
  const requestImages = useRequestStore(state => state.requestImages);

  const rerankItems: SmartFilterRerankItem[] = useMemo(() => {
    return (productsFromFindApi || [])
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
  }, [productsFromFindApi]);

  const onFilterClick = async (filter: { key: string; value: string }) => {
    if (
      smartFilters.selectedFilterKey === filter.key &&
      smartFilters.selectedFilterValue === filter.value
    ) {
      setSmartFilters({
        ...smartFilters,
        selectedFilterKey: null,
        selectedFilterValue: null,
        rerankStatus: 'idle',
      });
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
        rerankResponse?.rerankingApplied ?? (rerankedSkus.length > 0 ? true : false);

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
          : 'Could not generate smart filters.',
      });
    }
  };

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
      <div className="flex flex-wrap mx-4 gap-2 mt-4">
        {smartFilters.filters.map((filter, index) => {
          const isSelected =
            smartFilters.selectedFilterKey === filter.key &&
            smartFilters.selectedFilterValue === filter.value;
          return (
            <button
              key={`${filter.key}-${filter.value}-${index}`}
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
  );
}

export default SmartFilter;
