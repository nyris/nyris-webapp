import { create } from 'zustand';
import requestImageSlice from './requestImage/requestImage.slice';
import querySlice from './query/query.slice';
import filterSlice from './filter/filter.slice';
import miscSlice from './Misc/misc.slice';
import specificationsSlice from './specifications/specifications.slice';

type RequestStore = ReturnType<typeof requestImageSlice> &
  ReturnType<typeof querySlice> &
  ReturnType<typeof filterSlice> &
  ReturnType<typeof miscSlice> & { reset: () => void } &
  ReturnType<typeof specificationsSlice>

const useRequestStore = create<RequestStore>()((set, ...rest) => ({
  ...requestImageSlice(set, ...rest),
  ...querySlice(set, ...rest),
  ...filterSlice(set, ...rest),
  ...miscSlice(set, ...rest),
  ...specificationsSlice(set, ...rest),

  reset: () => {
    set(requestImageSlice(set, ...rest));
    set(querySlice(set, ...rest));
    set(filterSlice(set, ...rest));
    set(specificationsSlice(set, ...rest));
  },
}));

export default useRequestStore;
