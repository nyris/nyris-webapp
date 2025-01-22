import { FilterAction, FilterState } from 'stores/types';
import { StateCreator } from 'zustand';
import { initialState } from './filter.initialState';

const filterSlice: StateCreator<FilterState & FilterAction> = set => ({
  ...initialState,
  setAlgoliaFilter: filter => set(state => ({ algoliaFilter: filter })),
  setPreFilter: filter => set(state => ({ preFilter: filter })),
  setFirstSearchPreFilter: filter =>
    set(state => ({ firstSearchPreFilter: filter })),
});

export default filterSlice;
