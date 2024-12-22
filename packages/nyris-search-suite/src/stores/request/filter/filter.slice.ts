import { FilterAction, FilterState } from 'stores/types';
import { StateCreator } from 'zustand';
import { initialState } from './filter.initialState';

const filterSlice: StateCreator<FilterState & FilterAction> = set => ({
  ...initialState,
  setAlgoliaFilter: query => set(state => ({ algoliaFilter: query })),
  setPreFilter: query => set(state => ({ preFilter: query })),
});

export default filterSlice;
