import { useEffect, useMemo, useState } from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'components/Accordion';
import { Icon } from '@nyris/nyris-react-components';
import { useTranslation } from 'react-i18next';
import useResultStore from 'stores/result/resultStore';
import useRequestStore from 'stores/request/requestStore';
import { filterProductsByText } from 'utils/textSearchFilter';

function PostFilterFindApi({
  attribute,
  label,
  searchable,
  onVisibilityChange,
  isLastVisible,
}: {
  attribute: string;
  label: string;
  searchable: boolean;
  onVisibilityChange?: (attribute: string, isVisible: boolean) => void;
  isLastVisible?: boolean;
}) {
  const [itemsLimit, setItemsLimit] = useState(10);
  const [searchInput, setSearchInput] = useState<string>('');

  const productsFromFindApi = useResultStore(
    state => state.productsFromFindApi,
  );
  const groundingFilterResult = useResultStore(
    state => state.groundingFilterResult,
  );
  const showingGroundingFilterResult = useResultStore(
    state => state.showingGroundingFilterResult,
  );
  const query = useRequestStore(state => state.query);
  const requestImages = useRequestStore(state => state.requestImages);
  const postFilterSelections = useRequestStore(
    state => state.postFilterSelections,
  );
  const togglePostFilterSelection = useRequestStore(
    state => state.togglePostFilterSelection,
  );
  const { t } = useTranslation();

  const productsForFilters = useMemo(() => {
    let baseProducts = productsFromFindApi;

    if (requestImages?.length && query?.trim()) {
      baseProducts = filterProductsByText(query, productsFromFindApi);
    }

    if (showingGroundingFilterResult && groundingFilterResult?.length > 0) {
      const grounded = baseProducts.filter((product: any) =>
        groundingFilterResult.some((result: any) => product.sku === result.sku),
      );
      if (grounded.length > 0) {
        return grounded;
      }
    }

    return baseProducts;
  }, [
    productsFromFindApi,
    query,
    requestImages,
    showingGroundingFilterResult,
    groundingFilterResult,
  ]);

  const filteredProductsForCounts = useMemo(() => {
    const selections = postFilterSelections || {};
    const activeSelections = Object.entries(selections).filter(
      ([attr, values]) => attr !== attribute && Array.isArray(values),
    );

    if (!activeSelections.length) {
      return productsForFilters;
    }

    return productsForFilters.filter((product: any) =>
      activeSelections.every(([attr, values]) => {
        const filterValues = product.filters?.[attr];
        if (!Array.isArray(filterValues) || filterValues.length === 0) {
          return false;
        }
        return values.some(value => filterValues.includes(value));
      }),
    );
  }, [attribute, postFilterSelections, productsForFilters]);
  console.log({ filteredProductsForCounts });

  const valueCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredProductsForCounts?.forEach((product: any) => {
      const filterValues = product.filters?.[attribute];
      if (Array.isArray(filterValues)) {
        filterValues.forEach((val: string) => {
          if (val) counts[val] = (counts[val] || 0) + 1;
        });
      }
    });

    return counts;
  }, [attribute, filteredProductsForCounts]);

  const items = useMemo(() => {
    const selectedValues = postFilterSelections?.[attribute] || [];
    const allValues = new Set<string>([
      ...Object.keys(valueCounts),
      ...selectedValues,
    ]);

    return Array.from(allValues)
      .map(label => ({
        label,
        value: label,
        count: valueCounts[label] || 0,
        isRefined: selectedValues.includes(label),
      }))
      .filter(
        item =>
          !searchInput ||
          item.label.toLowerCase().includes(searchInput.toLowerCase()),
      )
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .slice(0, itemsLimit);
  }, [attribute, itemsLimit, postFilterSelections, searchInput, valueCounts]);

  const selectedValues = postFilterSelections?.[attribute] || [];
  const hasSelection = selectedValues.length > 0;
  const hasAvailableValues = Object.keys(valueCounts).length > 0;
  const hasSearch = searchable && searchInput.length > 0;
  const isVisible = hasAvailableValues || hasSelection || hasSearch;

  useEffect(() => {
    onVisibilityChange?.(attribute, isVisible);
  }, [attribute, isVisible, onVisibilityChange]);

  if (!isVisible) {
    return null;
  }

  const onShowMore = () => {
    setItemsLimit(prev => prev + 10);
  };

  return (
    <>
      <AccordionItem
        value={attribute}
        className={
          isLastVisible ? 'py-4' : 'border-b border-solid border-[#e0e0e0] py-4'
        }
      >
        <AccordionTrigger className="text-sm font-semibold w-full h-8 items-center">
          {label}
        </AccordionTrigger>
        {searchable && (
          <div
            style={{
              position: 'relative',
            }}
          >
            <input
              name="postfilter-search"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={512}
              value={searchInput}
              onChange={event => setSearchInput(event.currentTarget.value)}
              className="w-full h-8 rounded-2xl bg-[#F3F3F5] pl-8 pr-2 outline-none"
              style={{
                fontSize: 14,
              }}
              placeholder={`${t('Search')} ${label}`}
            />
            {searchInput && (
              <Icon
                name="close"
                className="absolute top-2.5 right-3 hover:cursor-pointer w-3 h-3"
                onClick={() => setSearchInput('')}
              />
            )}
            <Icon name="search" className="absolute top-2 left-2" />
          </div>
        )}

        {!items.length && (
          <div
            style={{
              fontSize: 14,
              paddingTop: 16,
            }}
          >
            {t('No filters found')}
          </div>
        )}
        <AccordionContent>
          <div className="flex flex-col gap-4 mt-4 ml-2">
            {items.map(item => (
              <div key={item.label}>
                <label className="flex items-center w-fit cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.isRefined}
                    onChange={() =>
                      togglePostFilterSelection(attribute, item.value)
                    }
                    className="cursor-pointer"
                  />
                  <span className="text-xs font-normal pl-2 pr-1">
                    {item.label}
                  </span>
                  <span className="text-xs font-normal">({item.count})</span>
                </label>
              </div>
            ))}
            {items.length === itemsLimit && (
              <button
                className="hover:bg-[#E9E9EC] rounded-[4px] p-2"
                style={{
                  fontSize: 14,
                }}
                onClick={onShowMore}
              >
                {t('Load More')}
              </button>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </>
  );
}

export default PostFilterFindApi;
