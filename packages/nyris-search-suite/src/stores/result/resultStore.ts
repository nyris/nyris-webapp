import { create } from 'zustand';
import productsSlice from './prodcuts/products.slice';
import detectedRegionsSlice from './detectedRegions/detectedRegions.slice';

type ResultStore = ReturnType<typeof productsSlice> &
  ReturnType<typeof detectedRegionsSlice>;

const useResultStore = create<ResultStore>()((...a) => ({
  ...productsSlice(...a),
  ...detectedRegionsSlice(...a),
}));

export default useResultStore;
