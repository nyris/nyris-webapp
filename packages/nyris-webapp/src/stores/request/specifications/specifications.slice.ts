import { SpecificationAction, SpecificationState } from 'stores/types';
import { StateCreator } from 'zustand';
import { initialState } from './specifications.initialState';

const filterSlice: StateCreator<SpecificationState & SpecificationAction> = set => ({
  ...initialState,
  setSpecifications: specifications => set(state => ({ specifications })),
  setNameplate: nameplate => set(state => ({ nameplate })),

});

export default filterSlice;
