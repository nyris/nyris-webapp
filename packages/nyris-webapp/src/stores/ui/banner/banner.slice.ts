import { StateCreator } from 'zustand';
import { BannerAction, BannerState } from 'stores/types';

import { initialState } from './banner.initialState';

const bannerSlice: StateCreator<BannerState & BannerAction> = set => ({
  ...initialState,
  setBannerGoBack: (bannerGoBack: boolean) => set({ bannerGoBack }),
  setBannerTextSearch: (bannerTextSearch: 'loading' | 'resolved' | 'pending') =>
    set({ bannerTextSearch }),
  resetBanner: () => set({ ...initialState }),
});

export default bannerSlice;
