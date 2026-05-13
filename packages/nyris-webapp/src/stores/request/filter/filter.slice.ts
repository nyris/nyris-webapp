import { FilterAction, FilterState } from 'stores/types';
import { StateCreator } from 'zustand';
import { initialState } from './filter.initialState';

const filterSlice: StateCreator<FilterState & FilterAction> = set => ({
  ...initialState,
  setAlgoliaFilter: filter => set(() => ({ algoliaFilter: filter })),
  setPreFilter: filter => set(() => ({ preFilter: filter })),
  setFirstSearchPreFilter: filter =>
    set(() => ({ firstSearchPreFilter: filter })),
  setSpecificationFilter: filter =>
    set(() => ({ specificationFilter: filter })),
  setPreFilterList: filter => set(() => ({ preFilterList: filter })),
  setPreFilterLoading: isLoading =>
    set(() => ({ preFilterLoading: isLoading })),
  setPostFilterSelections: filters =>
    set(() => ({ postFilterSelections: filters })),
  togglePostFilterSelection: (attribute, value) =>
    set(state => {
      const current = state.postFilterSelections?.[attribute] || [];
      const exists = current.includes(value);
      const nextValues = exists
        ? current.filter(item => item !== value)
        : [...current, value];
      const nextSelections = { ...state.postFilterSelections };

      if (nextValues.length > 0) {
        nextSelections[attribute] = nextValues;
      } else {
        delete nextSelections[attribute];
      }

      return { postFilterSelections: nextSelections };
    }),
  clearPostFilterSelections: () => set(() => ({ postFilterSelections: {} })),
});

export default filterSlice;
