import { NyrisAPISettings } from '@nyris/nyris-api';
import { NyrisAppState } from 'Store/nyris/types';
import { SearchState } from 'Store/search/types';

export interface AlgoliaSettings {
  apiKey: string;
  appId: string;
  indexName: string;
}

export interface Field {
  ctaLinkField: string;
  productName: string;
  productDetails: string;
  manufacturerNumber: string;
  productTag: string;
  warehouseNumber: string;
  warehouseNumberValue: string;
  warehouseShelfNumber: string;
  warehouseShelfNumberValue: string;
  warehouseStock: string;
  warehouseStockValue: string;
}

export interface AppSettings extends NyrisAPISettings {
  exampleImages?: string[]; // deprecated
  preview: boolean;
  cadSearch?: boolean;
  noImageUrl?: string;
  regions: boolean;
  instantRedirectPatterns: string[];
  theme: SearchSuiteSettings;
  algolia?: AlgoliaSettings;
  productCtaText?: string;
  appTitle?: string;
  refinements?: any;
  showGroup?: boolean;
  preFilterOption?: boolean;
  cadenas3dWebView?: boolean;
  catalog?: string;
  APIKey?: string;
  rfq?: boolean;
  inquiry?: boolean;
  templateId?: string;
  warehouseVariant?: boolean;
  preFilterTitle?: string;
  postFilterOption?: boolean;
  showFeedbackAndShare?: boolean;
  showMoreInfo?: boolean; // deprecated
  visualSearchFilterKey?: string;
  alogoliaFilterField?: string;
  headerText?: string;
  brandName?: string;
  shareOption?: boolean;
  language?: string;
  itemIdLabel?: string;
  field: Field;
}

export interface SearchSuiteSettings {
  appBarLogoUrl?: string;
  headerColor?: string;
  logoWidth?: string;
  logoHeight?: string;
  mobileFooterImageColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export type AppState = {
  search: SearchState;
  settings: AppSettings;
  nyrisDesign: NyrisAppState;
};

export interface CanvasWithId {
  canvas: HTMLCanvasElement;
  id: string;
}
