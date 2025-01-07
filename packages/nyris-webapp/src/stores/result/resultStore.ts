import { create } from 'zustand';
import productsSlice from './prodcuts/products.slice';
import detectedRegionsSlice from './detectedRegions/detectedRegions.slice';
import sessionSlice from './session/session.slice';

type ResultStore = ReturnType<typeof productsSlice> &
  ReturnType<typeof detectedRegionsSlice> &
  ReturnType<typeof sessionSlice> & { reset: () => void };

const useResultStore = create<ResultStore>()((set, ...rest) => ({
  ...productsSlice(set, ...rest),
  ...detectedRegionsSlice(set, ...rest),
  ...sessionSlice(set, ...rest),

  reset: () => {
    set(productsSlice(set, ...rest));
    set(detectedRegionsSlice(set, ...rest));
    set(sessionSlice(set, ...rest));
  },
}));

export default useResultStore;
