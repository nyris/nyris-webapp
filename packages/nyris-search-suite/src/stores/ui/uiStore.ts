import { create } from 'zustand';
import loadingSlice from './loading/loading.slice';

type UiStore = ReturnType<typeof loadingSlice>;

const useUiStore = create<UiStore>()((...a) => ({
  ...loadingSlice(...a),
}));
export default useUiStore;
