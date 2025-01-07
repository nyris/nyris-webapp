import { StateCreator } from 'zustand';
import { initialState } from './detectedRegions.initialState';
import { DetectedRegionsAction, DetectedRegionsState } from 'stores/types';

const detectedRegionsSlice: StateCreator<
  DetectedRegionsState & DetectedRegionsAction
> = (set, get) => ({
  ...initialState,
  setDetectedRegions: (region, index) => {
    const detectedObject = get().detectedRegions;
    let updatedDetectedObject = { ...detectedObject };
    updatedDetectedObject[index] = region;
    set(state => ({ detectedRegions: updatedDetectedObject }));
  },
});

export default detectedRegionsSlice;
