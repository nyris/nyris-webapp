import { StateCreator } from 'zustand';
import { initialState } from './products.initialState';
import { ProductsAction, ProductsState } from 'stores/types';

const productsSlice: StateCreator<ProductsState & ProductsAction> = set => ({
  ...initialState,
  setAlgoliaProducts: products =>
    set(() => ({ productsFromAlgolia: products })),
  setFindApiProducts: products =>
    set(() => ({ productsFromFindApi: products })),
  setFirstSearchResults: products =>
    set(() => ({ firstSearchResults: products })),
  setImageAnalysis: analysis =>
    set(() => ({
      imageAnalysis: {
        ...analysis,
      },
    })),
  setSpecificationFilteredProducts: products =>
    set(() => ({
      specificationFilteredProducts: products,
    })),
  setFirstRequestImageAnalysis: analysis =>
    set(() => ({
      firstRequestImageAnalysis: {
        ...analysis,
      },
    })),
  setGoogleGroundingResponse: result =>
    set(() => ({
      googleGroundingResponse: result,
    })),

  setGroundingFilterResult: result =>
    set(() => ({
      groundingFilterResult: result,
    })),
  setShowingGroundingFilterResult: (val?: boolean) =>
    set(state =>
      val === undefined
        ? { showingGroundingFilterResult: !state.showingGroundingFilterResult }
        : { showingGroundingFilterResult: val },
    ),
  setGroundingError: error =>
    set(() => ({
      groundingError: error,
    })),

  setFullResultPool: products =>
    set(() => ({
      fullResultPool: products,
    })),
  resetGrounding: () =>
    set(() => ({
      groundingError: null,
      groundingFilterResult: [],
      googleGroundingResponse: null,
      showingGroundingFilterResult: false,
    })),
  setSmartFilters: smartFilters =>
    set(() => ({
      smartFilters,
    })),
});

export default productsSlice;
