import { SpecificationAction, SpecificationState } from 'stores/types';
import { StateCreator } from 'zustand';
import { initialState } from './specifications.initialState';

const filterSlice: StateCreator<
  SpecificationState & SpecificationAction
> = set => ({
  ...initialState,
  setSpecifications: specifications => set(() => ({ specifications })),
  setNameplateNotificationText: nameplateNotificationText =>
    set(() => ({ nameplateNotificationText })),
  setShowLoading: showLoading => set(() => ({ showLoading })),
  setNameplateImage: nameplateImage => set(() => ({ nameplateImage })),
  setShowNotMatchedError: showNotMatchedError =>
    set(() => ({ showNotMatchedError })),
});

export default filterSlice;
