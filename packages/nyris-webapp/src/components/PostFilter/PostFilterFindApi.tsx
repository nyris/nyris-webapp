import { useEffect, useMemo, useState } from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'components/Accordion';
import { Icon } from '@nyris/nyris-react-components';
import { useTranslation } from 'react-i18next';
import { isEmpty } from 'lodash';
import useResultStore from 'stores/result/resultStore';
import useRequestStore from 'stores/request/requestStore';
import useUiStore from 'stores/ui/uiStore';
import useScopeStore from 'stores/scope/scopeStore';
import { find } from 'services/visualSearch';

let postFilterRequestCounter = 0;

export function invalidatePostFilterRequests() {
  postFilterRequestCounter += 1;
}

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

  const postFilterFacets = useResultStore(state => state.postFilterFacets);
  const setFindApiProducts = useResultStore(state => state.setFindApiProducts);
  const setPostFilterSelections = useRequestStore(
    state => state.setPostFilterSelections,
  );
  const postFilterSelections = useRequestStore(
    state => state.postFilterSelections,
  );
  const query = useRequestStore(state => state.query);
  const requestImages = useRequestStore(state => state.requestImages);
  const regions = useRequestStore(state => state.regions);
  const preFilter = useRequestStore(state => state.preFilter);
  const preFilterList = useRequestStore(state => state.preFilterList);
  const metaFilter = useRequestStore(state => state.metaFilter);
  const setIsFindApiLoading = useUiStore(state => state.setIsFindApiLoading);
  const { t } = useTranslation();
  const settings = window.settings;

  const scopeFilterEnabled = !!settings.scopeFilter;
  const scopeFilterAttributes = useScopeStore(state => state.filterAttributes);

  const scopedAllowedValues = useMemo(() => {
    if (!scopeFilterEnabled) {
      return null;
    }
    const scopeAttribute = scopeFilterAttributes[0];
    if (!scopeAttribute) {
      return new Set<string>();
    }
    return new Set(
      scopeAttribute.values.map(value => value.toLocaleLowerCase()),
    );
  }, [scopeFilterEnabled, scopeFilterAttributes]);

  const matchedFacet = useMemo(() => {
    const facets = Array.isArray(postFilterFacets) ? postFilterFacets : [];
    return facets.find(
      (entry: { name?: string }) =>
        entry.name?.toLocaleLowerCase() === attribute.toLocaleLowerCase(),
    );
  }, [attribute, postFilterFacets]);

  const preFilterApiKey =
    preFilterList.find(
      filter =>
        filter.key?.toLocaleLowerCase() ===
        settings.visualSearchFilterKey?.toLocaleLowerCase(),
    )?.key ?? settings.visualSearchFilterKey;

  const valueCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    (matchedFacet?.values || []).forEach(
      (entry: { value?: string; count?: number }) => {
        const value = entry?.value;
        if (value) {
          counts[value] = entry.count ?? 0;
        }
      },
    );

    return counts;
  }, [matchedFacet]);

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
          !scopedAllowedValues ||
          scopedAllowedValues.has(item.value.toLocaleLowerCase()),
      )
      .filter(
        item =>
          !searchInput ||
          item.label.toLowerCase().includes(searchInput.toLowerCase()),
      )
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .slice(0, itemsLimit);
  }, [
    attribute,
    itemsLimit,
    postFilterSelections,
    scopedAllowedValues,
    searchInput,
    valueCounts,
  ]);

  const selectedValues = postFilterSelections?.[attribute] || [];
  const hasSelection = selectedValues.length > 0;
  const hasAvailableValues = Object.keys(valueCounts).length > 0;
  const hasSearch = searchable && searchInput.length > 0;
  const isVisible =
    (!scopedAllowedValues || scopedAllowedValues.size > 0) &&
    (hasAvailableValues || hasSelection || hasSearch);

  useEffect(() => {
    onVisibilityChange?.(attribute, isVisible);
  }, [attribute, isVisible, onVisibilityChange]);

  const handleFilterClick = (value: string, isRefined: boolean) => {
    const currentSelections =
      useRequestStore.getState().postFilterSelections || {};
    const currentAttributeValues = currentSelections[attribute] || [];
    const nextAttributeValues = isRefined
      ? currentAttributeValues.filter(item => item !== value)
      : [...currentAttributeValues, value];

    const nextSelections = { ...currentSelections };
    if (nextAttributeValues.length > 0) {
      nextSelections[attribute] = nextAttributeValues;
    } else {
      delete nextSelections[attribute];
    }

    setPostFilterSelections(nextSelections);

    const hasAnySelection = Object.values(nextSelections).some(
      values => values.length > 0,
    );

    if (!hasAnySelection) {
      const snapshot = useResultStore.getState().initialFindSearchSnapshot;
      if (snapshot) {
        setFindApiProducts(snapshot.results);
      }
      return;
    }

    const facets = useResultStore.getState().postFilterFacets || [];
    const filters = [];

    if (!isEmpty(preFilter)) {
      filters.push({
        key: preFilterApiKey,
        values: Object.keys(preFilter).filter(key => preFilter[key]),
      });
    } else if (metaFilter) {
      filters.push({
        key: preFilterApiKey,
        values: [metaFilter],
      });
    }

    Object.entries(nextSelections).forEach(([attr, values]) => {
      if (values.length > 0) {
        const facet = facets.find(
          (entry: { name?: string }) =>
            entry.name?.toLocaleLowerCase() === attr.toLocaleLowerCase(),
        );
        filters.push({
          key: facet?.name ?? attr,
          values,
        });
      }
    });

    const requestId = ++postFilterRequestCounter;
    setIsFindApiLoading(true);
    void find({
      image: requestImages[0],
      settings,
      region: regions[0],
      filters,
      text: !requestImages[0] ? query : undefined,
    })
      .then(response => {
        if (requestId !== postFilterRequestCounter) {
          return;
        }
        setFindApiProducts(response?.results || []);
      })
      .finally(() => {
        if (requestId === postFilterRequestCounter) {
          setIsFindApiLoading(false);
        }
      });
  };

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
                      handleFilterClick(item.value, item.isRefined)
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
