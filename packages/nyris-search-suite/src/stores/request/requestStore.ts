import { create } from 'zustand';
import requestImageSlice from './requestImage/requestImage.slice';
import querySlice from './query/query.slice';
import filterSlice from './filter/filter.slice';

type RequestStore = ReturnType<typeof requestImageSlice> &
  ReturnType<typeof querySlice> &
  ReturnType<typeof filterSlice> & { reset: () => void };

const useRequestStore = create<RequestStore>()((set, ...rest) => ({
  ...requestImageSlice(set, ...rest),
  ...querySlice(set, ...rest),
  ...filterSlice(set, ...rest),
  reset: () => {
    set(requestImageSlice(set, ...rest));
    set(querySlice(set, ...rest));
    set(filterSlice(set, ...rest));
  },
}));

export default useRequestStore;
