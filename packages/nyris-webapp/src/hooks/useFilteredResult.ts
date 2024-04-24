import { useAppSelector } from 'Store/Store';
import { useMemo } from 'react';

function filterResultsBasedOnPostFilter(results: any, postFilter: any): any[] {
  return results?.filter((result: { filters: { [x: string]: any } }) => {
    return Object.keys(postFilter).every(filterType => {
      const filter = postFilter[filterType];

      const filterValues = Object.keys(filter).filter(key => filter[key]);

      if (filterValues.length > 0) {
        const resultFilterValues = result.filters[filterType];
        if (resultFilterValues) {
          return filterValues?.some((value: any) =>
            resultFilterValues.includes(value),
          );
        }
      }
      return true;
    });
  });
}

export const useFilteredResult = (data: any) => {
  const { postFilter } = useAppSelector(state => state.search);
  return useMemo(() => {
    return filterResultsBasedOnPostFilter(data, postFilter || {});
  }, [data, postFilter]);
};
