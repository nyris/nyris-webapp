import { Region } from '@nyris/nyris-api';
import { create } from 'zustand';

interface ResultState {
  detectedObject: Record<number, Region[]>;
  setDetectedObject: (region: Region[], index: number) => void;
  reset: () => void;
}

const useResultStore = create<ResultState>()((set, get) => ({
  detectedObject: {},
  setDetectedObject: (region, index) => {
    const detectedObject = get().detectedObject;
    let updatedDetectedObject = { ...detectedObject };
    updatedDetectedObject[index] = region;
    set(state => ({ detectedObject: updatedDetectedObject }));
  },

  reset: () =>
    set(state => ({
      detectedObject: {},
    })),
}));

export default useResultStore;
