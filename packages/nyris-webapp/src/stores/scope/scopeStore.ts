import { create } from 'zustand';
import { Filter } from '@nyris/nyris-api';

interface ScopeState {
  itemKeys: string[];
  filterAttributes: Filter[];
  isLoading: boolean;
  hasFetched: boolean;
}

interface ScopeAction {
  setScope: (itemKeys: string[], filterAttributes: Filter[]) => void;
  setScopeLoading: (isLoading: boolean) => void;
  setScopeFetched: (hasFetched: boolean) => void;
  resetScope: () => void;
}

const initialState: ScopeState = {
  itemKeys: [],
  filterAttributes: [],
  isLoading: false,
  hasFetched: false,
};

const useScopeStore = create<ScopeState & ScopeAction>()(set => ({
  ...initialState,

  setScope: (itemKeys, filterAttributes) =>
    set({ itemKeys, filterAttributes, hasFetched: true }),
  setScopeLoading: isLoading => set({ isLoading }),
  setScopeFetched: hasFetched => set({ hasFetched }),
  resetScope: () => set(initialState),
}));

export default useScopeStore;
