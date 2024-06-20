import { Region } from "@nyris/nyris-api";

export const getRegionByMaxConfidence = (regions: Region[]) => {
  if (regions.length === 0) {
    return { x1: 0, x2: 1, y1: 0, y2: 1 };
  }
  const regionWithMaxConfidence = regions.reduce((prev, current) => {
    prev.confidence = prev.confidence || 0;
    current.confidence = current.confidence || 0;
    return prev.confidence >= current.confidence ? prev : current;
  });
  return regionWithMaxConfidence.normalizedRect;
};
