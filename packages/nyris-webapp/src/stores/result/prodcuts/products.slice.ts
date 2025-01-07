import { StateCreator } from 'zustand';
import { initialState } from './products.initialState';
import { ProductsAction, ProductsState } from 'stores/types';

const productsSlice: StateCreator<ProductsState & ProductsAction> = set => ({
  ...initialState,
  setAlgoliaProducts: products =>
    set(state => ({ productsFromAlgolia: products })),
  setFindApiProducts: products =>
    set(state => ({ productsFromFindApi: products })),
  setFirstSearchResults: products =>
    set(state => ({ firstSearchResults: products })),
});

export default productsSlice;
