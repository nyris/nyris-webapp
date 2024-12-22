import { StateCreator } from 'zustand';
import { initialState } from './loading.initialState';
import { LoadingAction, LoadingState } from 'stores/types';

const loadingSlice: StateCreator<LoadingState & LoadingAction> = set => ({
  ...initialState,
  setIsAlgoliaLoading: (isLoading: boolean) =>
    set(state => ({ isAlgoliaLoading: isLoading })),
  setIsFindApiLoading: (isLoading: boolean) =>
    set(state => ({ isFindApiLoading: isLoading })),
});

export default loadingSlice;
