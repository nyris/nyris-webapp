import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'components/Accordion';
import { useRefinementList } from 'react-instantsearch';

// import { Icon } from '@nyris/nyris-react-components';

function PostFilter({
  attribute,
  label,
  searchable,
}: {
  attribute: string;
  label: string;
  searchable: boolean;
}) {
  const {
    items,
    refine,
    // searchForItems,
    // canToggleShowMore,
    // isShowingMore,
    // toggleShowMore,
  } = useRefinementList({
    attribute: attribute,
    operator: 'or',
    showMore: false,
    sortBy: ['name:desc'],
  });

  return (
    <>
      <AccordionItem value={attribute}>
        <AccordionTrigger className="text-sm font-semibold w-full h-8 items-center">
          {label}
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-4 mt-4">
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
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* <div className="relative my-4">
        <input
          type="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={512}
          onChange={event => searchForItems(event.currentTarget.value)}
          className="w-full h-8 rounded-2xl bg-[#F3F3F5] pl-8 outline-none"
        ></input>
        <Icon name="search" className="absolute top-2 left-2" />
      </div> */}

      {/* <button onClick={toggleShowMore} disabled={!canToggleShowMore}>
        {isShowingMore ? 'Show less' : 'Show more'}
      </button> */}
    </>
  );
}

export default PostFilter;
