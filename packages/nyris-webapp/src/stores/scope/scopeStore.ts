import { create } from 'zustand';
import { Filter } from '@nyris/nyris-api';

interface ScopeState {
  itemKeys: string[];
  filterAttributes: Filter[];
  isLoading: boolean;
}

interface ScopeAction {
  setScope: (itemKeys: string[], filterAttributes: Filter[]) => void;
  setScopeLoading: (isLoading: boolean) => void;
  resetScope: () => void;
}

const initialState: ScopeState = {
  itemKeys: [],
  filterAttributes: [],
  isLoading: false,
};

const useScopeStore = create<ScopeState & ScopeAction>()(set => ({
  ...initialState,

  setScope: (itemKeys, filterAttributes) =>
    set({ itemKeys, filterAttributes }),
  setScopeLoading: isLoading => set({ isLoading }),
  resetScope: () => set(initialState),
}));

export default useScopeStore;
