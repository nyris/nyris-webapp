import { ProductsState } from 'stores/types';

export const initialState: ProductsState = {
  productsFromAlgolia: [],
  productsFromFindApi: [],
  firstSearchResults: [],
  imageAnalysis: {
    imageDescription: '',
    optimizedSearchQuery: '',
    specification: {},
  },
  specificationFilteredProducts: [],
  firstRequestImageAnalysis: {
    imageDescription: '',
    optimizedSearchQuery: '',
    specification: {},
  },

  googleGroundingResponse: null,
  groundingFilterResult: [],
  showingGroundingFilterResult: false,
  groundingError: null,
  firstAlgoliaProducts: [],
  fullResultPool: [],
  smartFilters: {
    status: 'idle',
    filters: [],
    selectedFilterKey: null,
    selectedFilterValue: null,
    rerankedSkus: [],
    rerankStatus: 'idle',
    errorMessage: null,
  },
  postFilterFacets: [],
  initialFindSearchSnapshot: null,
};
