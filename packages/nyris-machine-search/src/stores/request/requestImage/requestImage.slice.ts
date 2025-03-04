import { RequestImageState, RequestImageAction } from 'stores/types';
import { StateCreator } from 'zustand';
import { initialState } from './requestImage.initialState';

const requestImageSlice: StateCreator<
  RequestImageState & RequestImageAction
> = (set, get) => ({
  ...initialState,

  addRequestImage: image =>
    set(state => ({ requestImages: [...state.requestImages, image] })),

  setRequestImages: images => set(state => ({ requestImages: images })),

  setFirstSearchImage: image => set(state => ({ firstSearchImage: image })),

  removeImage: index => {
    const images = get().requestImages;
    let updatedImages = [...images];

    if (index < 0 || index >= images.length) {
      return;
    }
    updatedImages.splice(index, 1);
    set(state => ({ requestImages: updatedImages }));
  },

  updateRegion: (region, index) => {
    const regions = get().regions;
    let updatedRegions = [...regions];
    updatedRegions[index] = region;

    set(state => ({ regions: updatedRegions }));
  },

  setRegions: regions => set(state => ({ regions: regions })),
  resetRegions: () =>
    set(state => ({
      regions: [Array(3)].map(() => {
        return { x1: 0, x2: 1, y1: 0, y2: 1 };
      }),
    })),
});

export default requestImageSlice;
