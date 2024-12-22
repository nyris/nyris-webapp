import React from 'react';
import { useRefinementList } from 'react-instantsearch';

function PostFilter({ attribute }: { attribute: string }) {
  const {
    items,
    refine,
    searchForItems,
    canToggleShowMore,
    isShowingMore,
    toggleShowMore,
  } = useRefinementList({
    attribute: attribute,
    operator: 'or',
    showMore: true,
    showMoreLimit: 20,
  });

  return (
    <>
      <input
        type="search"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        maxLength={512}
        onChange={event => searchForItems(event.currentTarget.value)}
      />
      <ul>
        {items.map(item => (
          <li key={item.label}>
            <label>
              <input
                type="checkbox"
                checked={item.isRefined}
                onChange={() => refine(item.value)}
              />
              <span>{item.label}</span>
              <span>({item.count})</span>
            </label>
          </li>
        ))}
      </ul>
      <button onClick={toggleShowMore} disabled={!canToggleShowMore}>
        {isShowingMore ? 'Show less' : 'Show more'}
      </button>
    </>
  );
}

export default PostFilter;
