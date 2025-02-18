import { FilterState } from 'stores/types';

export const initialState: FilterState = {
  algoliaFilter: '',
  visualSearchSkus: [],
  preFilter: {},
  firstSearchPreFilter: {},
};
