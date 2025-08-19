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
};
