import { create } from 'zustand';
import productsSlice from './prodcuts/products.slice';
import detectedRegionsSlice from './detectedRegions/detectedRegions.slice';
import sessionSlice from './session/session.slice';

type ResultStore = ReturnType<typeof productsSlice> &
  ReturnType<typeof detectedRegionsSlice> &
  ReturnType<typeof sessionSlice>;

const useResultStore = create<ResultStore>()((...a) => ({
  ...productsSlice(...a),
  ...detectedRegionsSlice(...a),
  ...sessionSlice(...a),
}));

export default useResultStore;
