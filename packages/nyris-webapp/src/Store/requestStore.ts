import { RectCoords } from '@nyris/nyris-api';
import { create } from 'zustand';

interface RequestState {
  requestImages: HTMLCanvasElement[];
  query?: string;
  regions: RectCoords[];

  addRequestImage: (image: HTMLCanvasElement) => void;
  setRequestImages: (images: HTMLCanvasElement[]) => void;
  updateRegion: (r: RectCoords, index: number) => void;
  setRegions: (r: RectCoords[]) => void;
  setQuery: (query: string) => void;
  removeImage: (index: number) => void;
  resetRegions: () => void;
  reset: () => void;
}

const useRequestStore = create<RequestState>()((set, get) => ({
  requestImages: [],
  query: '',
  regions: [Array(3)].map(() => {
    return { x1: 0, x2: 1, y1: 0, y2: 1 };
  }),

  addRequestImage: image =>
    set(state => ({ requestImages: [...state.requestImages, image] })),

  setRequestImages: images => set(state => ({ requestImages: images })),

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
  setQuery: query => set(state => ({ query: query })),

  resetRegions: () =>
    set(state => ({
      regions: [Array(3)].map(() => {
        return { x1: 0, x2: 1, y1: 0, y2: 1 };
      }),
    })),

  reset: () =>
    set(state => ({
      requestImages: [],
      query: '',
      regions: [Array(3)].map(() => {
        return { x1: 0, x2: 1, y1: 0, y2: 1 };
      }),
    })),
}));

export default useRequestStore;
