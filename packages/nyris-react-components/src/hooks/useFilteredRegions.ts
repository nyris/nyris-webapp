import { useMemo } from 'react';

const useFilteredRegions = ({
  regions,
  gripSize,
  gripStrokeWidth,
  height,
  imageSelection,
  minX,
  minY,
  width,
}: {
  regions: any;
  imageSelection: any;
  width: any;
  height: any;
  minX: any;
  minY: any;
  gripSize: any;
  gripStrokeWidth: any;
}) => {
  const filteredRegions = useMemo(
    () =>
      regions?.map(
        (region: {
          normalizedRect: { x1: any; x2: any; y1: any; y2: any };
        }) => {
          let newState = {
            x1: region.normalizedRect.x1 * width,
            x2: region.normalizedRect.x2 * width,
            y1: region.normalizedRect.y1 * height,
            y2: region.normalizedRect.y2 * height,
          };

          const xGap =
            minX + gripSize - (newState.x2 - newState.x1) + gripStrokeWidth;
          const yGap =
            minY + gripSize - (newState.y2 - newState.y1) + gripStrokeWidth;

          if (newState.x2 - newState.x1 < minX + gripSize) {
            newState.x1 = newState.x1 - xGap / 2;
            newState.x2 = newState.x2 + xGap / 2;
          }

          if (newState.y2 - newState.y1 < minY + gripSize) {
            newState.y1 = newState.y1 - yGap / 2;
            newState.y2 = newState.y2 + yGap / 2;
          }

          const scaledRegion = {
            x1: newState.x1 / width,
            x2: newState.x2 / width,
            y1: newState.y1 / height,
            y2: newState.y2 / height,
          };

          if (
            scaledRegion.x1 === imageSelection?.x1 &&
            scaledRegion.x2 === imageSelection?.x2 &&
            scaledRegion.y1 === imageSelection?.y1 &&
            scaledRegion.y2 === imageSelection?.y2
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
