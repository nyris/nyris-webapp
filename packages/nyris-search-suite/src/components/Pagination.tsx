import React from 'react';
import { usePagination, UsePaginationProps } from 'react-instantsearch';
import { HitsPerPage } from './HitsPerPage';

export const Pagination = (props: UsePaginationProps) => {
  const {
    pages,
    currentRefinement,
    nbPages,
    isFirstPage,
    isLastPage,
    refine,
    createURL,
  } = usePagination(props);
  const firstPageIndex = 0;
  const previousPageIndex = currentRefinement - 1;
  const nextPageIndex = currentRefinement + 1;
  const lastPageIndex = nbPages - 1;

  return (
    <div className="flex gap-4">
      <HitsPerPage
        items={[
          { label: '10', value: 10 },
          { label: '20', value: 20, default: true },
          { label: '30', value: 30 },
          { label: '40', value: 40 },
          { label: '50', value: 50 },
        ]}
      />
      <PaginationItem
        isDisabled={isFirstPage}
        href={createURL(firstPageIndex)}
        onClick={() => refine(firstPageIndex)}
      >
        First
      </PaginationItem>
      <PaginationItem
        isDisabled={isFirstPage}
        href={createURL(previousPageIndex)}
        onClick={() => refine(previousPageIndex)}
      >
        Previous
      </PaginationItem>
      {pages.map(page => {
        const label = page + 1;

        return (
          <PaginationItem
            key={page}
            isDisabled={false}
            aria-label={`Page ${label}`}
            href={createURL(page)}
            onClick={() => refine(page)}
          >
            {label}
          </PaginationItem>
        );
      })}
      <PaginationItem
        isDisabled={isLastPage}
        href={createURL(nextPageIndex)}
        onClick={() => refine(nextPageIndex)}
      >
        Next
      </PaginationItem>
      <PaginationItem
        isDisabled={isLastPage}
        href={createURL(lastPageIndex)}
        onClick={() => refine(lastPageIndex)}
      >
        Last
      </PaginationItem>
    </div>
  );
};

type PaginationItemProps = Omit<React.ComponentProps<'a'>, 'onClick'> & {
  onClick: NonNullable<React.ComponentProps<'a'>['onClick']>;
  isDisabled: boolean;
};

function PaginationItem({
  isDisabled,
  href,
  onClick,
  ...props
}: PaginationItemProps) {
  if (isDisabled) {
    return <span {...props} />;
  }

  return (
    <a
      aria-label="pagination"
      href={href}
      onClick={event => {
        if (isModifierClick(event)) {
          return;
        }

        event.preventDefault();

        onClick(event);
      }}
      {...props}
    />
  );
}

function isModifierClick(event: React.MouseEvent) {
  const isMiddleClick = event.button === 1;

  return Boolean(
    isMiddleClick ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey,
  );
}
