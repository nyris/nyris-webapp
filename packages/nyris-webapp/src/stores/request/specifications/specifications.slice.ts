import { SpecificationAction, SpecificationState } from 'stores/types';
import { StateCreator } from 'zustand';
import { initialState } from './specifications.initialState';

const filterSlice: StateCreator<SpecificationState & SpecificationAction> = set => ({
  ...initialState,
  setSpecifications: specifications => set(state => ({ specifications })),
  setNameplateNotificationText: nameplateNotificationText => set(state => ({ nameplateNotificationText })),
  setShowLoading: showLoading => set(state => ({ showLoading })),
  setNameplateImage: nameplateImage => set(state => ({ nameplateImage })),
  setShowNotMatchedError: showNotMatchedError => set(state => ({ showNotMatchedError })),

});

export default filterSlice;
