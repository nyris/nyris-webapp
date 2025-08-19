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
  setImageAnalysis: analysis =>
    set(state => ({
      imageAnalysis: {
        ...analysis,
      },
    })),
  setSpecificationFilteredProducts: products =>
    set(state => ({
      specificationFilteredProducts: products,
    })),
  setFirstRequestImageAnalysis: analysis =>
    set(state => ({
      firstRequestImageAnalysis: {
        ...analysis,
      },
    })),
});

export default productsSlice;
