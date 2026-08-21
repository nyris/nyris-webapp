import { useEffect, useMemo, useState } from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'components/Accordion';
import { useRefinementList } from 'react-instantsearch';
import { Icon } from '@nyris/nyris-react-components';
import { useTranslation } from 'react-i18next';
import useScopeStore from 'stores/scope/scopeStore';

function PostFilter({
  attribute,
  label,
  searchable: _searchable,
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
  const {
    items: allItems,
    refine,
    searchForItems,
  } = useRefinementList({
    attribute: attribute,
    operator: 'or',
    showMore: false,
    limit: itemsLimit,
  });

  const { t } = useTranslation();

  const scopeFilterEnabled = window.settings.scopeFilter;
  const scopeFilterAttributes = useScopeStore(state => state.filterAttributes);

  const scopedAllowedValues = useMemo(() => {
    if (!scopeFilterEnabled || !window.settings.auth0.enabled) {
      return null;
    }
    // todo: support multiple attributes in the future
    const scopeAttribute = scopeFilterAttributes[0];
    if (!scopeAttribute) {
      return new Set<string>();
    }
    return new Set(
      scopeAttribute.values.map(value => value.toLocaleLowerCase()),
    );
  }, [scopeFilterEnabled, scopeFilterAttributes]);

  const items = useMemo(() => {
    if (!scopedAllowedValues) {
      return allItems;
    }
    return allItems.filter(item =>
      scopedAllowedValues.has(item.value.toLocaleLowerCase()),
    );
  }, [allItems, scopedAllowedValues]);

  useEffect(() => {
    searchForItems(searchInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const hasSelection = items.some(item => item.isRefined);
  const hasAvailableValues = items.length > 0 || searchInput.length > 0;
  const isVisible =
    (!scopedAllowedValues || scopedAllowedValues.size > 0) &&
    (hasAvailableValues || hasSelection);

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
                    onChange={() => refine(item.value)}
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

export default PostFilter;
