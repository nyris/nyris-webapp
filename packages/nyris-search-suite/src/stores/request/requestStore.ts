import { create } from 'zustand';
import requestImageSlice from './requestImage/requestImage.slice';
import querySlice from './query/query.slice';
import { filter } from 'lodash';
import filterSlice from './filter/filter.slice';

type RequestStore = ReturnType<typeof requestImageSlice> &
  ReturnType<typeof querySlice> &
  ReturnType<typeof filterSlice>;

const useRequestStore = create<RequestStore>()((...a) => ({
  ...requestImageSlice(...a),
  ...querySlice(...a),
  ...filterSlice(...a),
}));
export default useRequestStore;
