import { create } from 'zustand';
import loadingSlice from './loading/loading.slice';
import feedbackSlice from './feedback/feedback.slice';

type UiStore = ReturnType<typeof loadingSlice> &
  ReturnType<typeof feedbackSlice>;

const useUiStore = create<UiStore>()((...a) => ({
  ...loadingSlice(...a),
  ...feedbackSlice(...a),
}));
export default useUiStore;
