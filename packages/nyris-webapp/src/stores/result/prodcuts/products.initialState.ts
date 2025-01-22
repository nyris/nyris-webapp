import { ProductsState } from 'stores/types';

export const initialState: ProductsState = {
  productsFromAlgolia: [],
  productsFromFindApi: [],
  firstSearchResults: [],
};
