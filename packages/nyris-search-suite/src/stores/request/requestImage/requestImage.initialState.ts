import { RequestImageState } from 'stores/types';

export const initialState: RequestImageState = {
  regions: [Array(3)].map(() => {
    return { x1: 0, x2: 1, y1: 0, y2: 1 };
  }),
  requestImages: [],
};
