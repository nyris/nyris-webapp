import { create } from 'zustand';
import loadingSlice from './loading/loading.slice';
import feedbackSlice from './feedback/feedback.slice';
import sidePanelSlice from './sidePanel/sidePanel.slice';

type UiStore = ReturnType<typeof loadingSlice> &
  ReturnType<typeof feedbackSlice> &
  ReturnType<typeof sidePanelSlice>;

const useUiStore = create<UiStore>()((...a) => ({
  ...loadingSlice(...a),
  ...feedbackSlice(...a),
  ...sidePanelSlice(...a),
}));
export default useUiStore;
