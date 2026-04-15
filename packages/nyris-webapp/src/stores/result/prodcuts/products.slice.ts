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
  setGoogleGroundingResponse: result =>
    set(state => ({
      googleGroundingResponse: result,
    })),

  setGroundingFilterResult: result =>
    set(state => ({
      groundingFilterResult: result,
    })),
  setShowingGroundingFilterResult: (val?: boolean) =>
    set(state =>
      val === undefined
        ? { showingGroundingFilterResult: !state.showingGroundingFilterResult }
        : { showingGroundingFilterResult: val },
    ),
  setGroundingError: error =>
    set(state => ({
      groundingError: error,
    })),
  setFirstAlgoliaProducts: products =>
    set(state => ({ firstAlgoliaProducts: products })),
  setFullResultPool: products =>
    set(state => ({
      fullResultPool: products,
    })),
});

export default productsSlice;
