import { usePagination, UsePaginationProps } from 'react-instantsearch';
import { Icon } from '@nyris/nyris-react-components';

export const Pagination = (props: UsePaginationProps) => {
  const { pages, currentRefinement, isFirstPage, isLastPage, refine } =
    usePagination(props);
  const previousPageIndex = currentRefinement - 1;
  const nextPageIndex = currentRefinement + 1;

  return (
    <div className="h-12 justify-center items-start inline-flex my-6">
      <div className="w-12 h-12 p-3.5 justify-center items-center flex">
        <div
          className="w-5 h-5 relative flex-col justify-start items-start flex cursor-pointer"
          onClick={() => {
            if (isFirstPage) return;
            refine(previousPageIndex);
          }}
        >
          <Icon name="caret_left" className="w-5 h-5" />
        </div>
      </div>
      {pages.map(page => {
        const label = page + 1;

        return (
          <div
            key={page}
            className="w-12 px-4 pt-[15px] flex-col justify-end items-center gap-[11px] inline-flex cursor-pointer"
            onClick={event => {
              event.preventDefault();

              refine(page);
            }}
          >
            <div className="text-center text-sm font-normal leading-[18px] tracking-tight">
              {label}
            </div>
            {currentRefinement === page && (
              <div className="w-4 h-1 bg-primary" />
            )}
          </div>
        );
      })}

      <div className="w-12 h-12 p-3.5 justify-center items-center flex">
        <div
          className="w-5 h-5 relative flex-col justify-start items-start flex cursor-pointer"
          onClick={() => {
            if (isLastPage) return;
            refine(nextPageIndex);
          }}
        >
          <Icon name="caret_right" className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
