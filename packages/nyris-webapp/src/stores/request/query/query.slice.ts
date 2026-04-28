import { QueryAction, QueryState } from 'stores/types';
import { StateCreator } from 'zustand';
import { initialState } from './query.initialState';

const querySlice: StateCreator<QueryState & QueryAction> = set => ({
  ...initialState,
  setQuery: query => set(() => ({ query: query })),
  setValueInput: value => set(() => ({ valueInput: value })),
});

export default querySlice;
