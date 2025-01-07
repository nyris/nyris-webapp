import { useMemo } from 'react';

const useFilteredRegions = (regions: any, imageSelection: any) => {
  const filteredRegions = useMemo(
    () =>
      regions?.map(
        (region: {
          normalizedRect: { x1: any; x2: any; y1: any; y2: any };
        }) => {
          if (
            region.normalizedRect?.x1 === imageSelection?.x1 &&
            region.normalizedRect?.x2 === imageSelection?.x2 &&
            region.normalizedRect?.y1 === imageSelection?.y1 &&
            region.normalizedRect?.y2 === imageSelection?.y2
          ) {
            return { ...region, show: false };
          }
          if (
            imageSelection?.x1 === 0 &&
            imageSelection?.x2 === 1 &&
            imageSelection?.y1 === 0 &&
            imageSelection?.y2 === 1
          ) {
            return { ...region, show: false };
          }

          return { ...region, show: true };
        },
      ),

    [regions, imageSelection],
  );

  return filteredRegions;
};

export default useFilteredRegions;
