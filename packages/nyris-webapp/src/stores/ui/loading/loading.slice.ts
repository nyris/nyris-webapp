import { StateCreator } from 'zustand';
import { initialState } from './loading.initialState';
import { LoadingAction, LoadingState } from 'stores/types';

const loadingSlice: StateCreator<LoadingState & LoadingAction> = set => ({
  ...initialState,
  setIsAlgoliaLoading: (isLoading: boolean) =>
    set(() => ({ isAlgoliaLoading: isLoading })),
  setIsFindApiLoading: (isLoading: boolean) =>
    set(() => ({ isFindApiLoading: isLoading })),
  setIsCadenasLoaded: (isLoading: boolean) =>
    set(() => ({ isCadenasLoaded: isLoading })),
  setIsGoogleGroundingLoading: isLoading =>
    set(() => ({
      isGoogleGroundingLoading: isLoading,
    })),
});

export default loadingSlice;
