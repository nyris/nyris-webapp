import { useAppSelector } from 'Store/Store';
import { useMemo } from 'react';

// Function to count occurrences and create array of objects
function countOccurrences(inputArray: any[]) {
  const countMap: any = {};
  inputArray.forEach((value: string | number) => {
    countMap[value] = (countMap[value] || 0) + 1;
  });

  return Object.entries(countMap).map(([value, count]) => ({
    value,
    count,
  }));
}

const getNextFilters = (data: any[], postFilters: any): any => {
  const nextFilters: any = {};

  data?.forEach(element => {
    const filters = element.filters;
    const keys = Object.keys(filters);

    for (let i = 0; i < keys.length; i++) {
      const xKey = keys[i];

      let isNextFilter = keys.every(yKey => {
        if (xKey !== yKey) {
          const postFilter = postFilters[yKey] || {};
          const filter = filters[yKey] || {};

          const postFilterValues = Object.keys(postFilter).filter(
            key => postFilter[key],
          );

          if (postFilterValues?.length > 0) {
            return postFilterValues?.some(element => {
              return filter?.includes(element);
            });
          }
          return true;
        }
        return true;
      });

      if (isNextFilter) {
        if (nextFilters[xKey]) {
          nextFilters[xKey] = [...nextFilters[xKey], ...filters[xKey]];
        } else {
          nextFilters[xKey] = filters[xKey];
        }
      }
    }
  });

  return nextFilters;
};

export const useFilter = (data: any) => {
  const { postFilter } = useAppSelector(state => state.search);

  const filters = useMemo(() => {
    return getNextFilters(data, postFilter);
  }, [data, postFilter]);

  const filterCount = useMemo(() => {
    const resultObject: any = {};
    for (const key in filters) {
      if (filters.hasOwnProperty(key)) {
        resultObject[key] = countOccurrences(filters[key]);
      }
    }

    return resultObject;
  }, [filters]);

  // If there is no item for a selected filter add the filter with count 0
  Object.keys(postFilter).forEach(key => {
    const filter = postFilter[key];
    Object.keys(filter).forEach(value => {
      const isNextFilter = filterCount[key].some((data: { value: string }) => {
        return data.value === value;
      });

      if (!isNextFilter) {
        filterCount[key].push({ value, count: 0 });
      }
    });
  });

  return filterCount;
};
