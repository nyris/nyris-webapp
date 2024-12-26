import { create } from 'zustand';
import requestImageSlice from './requestImage/requestImage.slice';
import querySlice from './query/query.slice';
import filterSlice from './filter/filter.slice';
import miscSlice from './Misc/misc.slice';

type RequestStore = ReturnType<typeof requestImageSlice> &
  ReturnType<typeof querySlice> &
  ReturnType<typeof filterSlice> &
  ReturnType<typeof miscSlice> & { reset: () => void };

const useRequestStore = create<RequestStore>()((set, ...rest) => ({
  ...requestImageSlice(set, ...rest),
  ...querySlice(set, ...rest),
  ...filterSlice(set, ...rest),
  ...miscSlice(set, ...rest),

  reset: () => {
    set(requestImageSlice(set, ...rest));
    set(querySlice(set, ...rest));
    set(filterSlice(set, ...rest));
  },
}));

export default useRequestStore;
