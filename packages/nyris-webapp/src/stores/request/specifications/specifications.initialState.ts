import { SpecificationState } from 'stores/types';

export const initialState: SpecificationState = {
  specifications: null,
  nameplateNotificationText: '',
  showLoading: false,
  nameplateImage: null,
  isResultPrefilterOpened: false,
};
