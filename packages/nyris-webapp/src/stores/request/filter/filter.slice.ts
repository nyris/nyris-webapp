import { FilterAction, FilterState } from 'stores/types';
import { StateCreator } from 'zustand';
import { initialState } from './filter.initialState';

const filterSlice: StateCreator<FilterState & FilterAction> = set => ({
  ...initialState,
  setAlgoliaFilter: filter => set(state => ({ algoliaFilter: filter })),
  setPreFilter: filter => set(state => ({ preFilter: filter })),
  setFirstSearchPreFilter: filter =>
    set(state => ({ firstSearchPreFilter: filter })),
  setSpecificationFilter: filter =>
    set(state => ({ specificationFilter: filter })),
  setPreFilterList: filter => set(state => ({ preFilterList: filter })),
  setPreFilterLoading: isLoading =>
    set(state => ({ preFilterLoading: isLoading })),
  setPostFilterSelections: filters =>
    set(state => ({ postFilterSelections: filters })),
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
  clearPostFilterSelections: () => set(state => ({ postFilterSelections: {} })),
});

export default filterSlice;
