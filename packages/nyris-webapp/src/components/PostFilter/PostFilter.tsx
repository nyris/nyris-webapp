import {useEffect, useState} from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'components/Accordion';
import { useRefinementList } from 'react-instantsearch';
import { Icon } from '@nyris/nyris-react-components';
import { useTranslation } from 'react-i18next';

function PostFilter({
  attribute,
  label,
  searchable,
}: {
  attribute: string;
  label: string;
  searchable: boolean;
}) {
  const [itemsLimit, setItemsLimit] = useState(10);
  const [searchInput, setSearchInput] = useState<string>('')
  const {
    items,
    refine,
    searchForItems,
  } = useRefinementList({
    attribute: attribute,
    operator: 'or',
    showMore: false,
    sortBy: ['name:asc'],
    limit: itemsLimit,
  });

  const { t } = useTranslation();

  useEffect(() => {
    searchForItems(searchInput);
  }, [searchInput]);

  const onShowMore = () => {
    setItemsLimit((prev) => prev + 10);
  };

  return (
    <>
      <AccordionItem value={attribute}>
        <AccordionTrigger className="text-sm font-semibold w-full h-8 items-center">
          {label}
        </AccordionTrigger>
        <div
          style={{
            position: 'relative'
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
            No filters found
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
                  fontSize: 14
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
