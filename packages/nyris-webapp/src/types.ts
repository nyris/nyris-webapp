import { NyrisAPISettings } from '@nyris/nyris-api';
import { SearchState } from 'Store/search/types';

export interface AlgoliaSettings {
  apiKey: string;
  appId: string;
  enabled?: boolean;
  indexName: string;
}

export interface Auth0Settings {
  clientId?: string;
  domain?: string;
  enabled?: boolean;
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
  alogoliaFilterField?: string;
  appTitle?: string;
  auth0: Auth0Settings;
  brandName?: string;
  cadenas3dWebView?: boolean;
  catalog?: string;
  cadenasAPIKey?: string;
  field: Field;
  headerText?: string;
  inquiry?: boolean;
  itemIdLabel?: string;
  language?: string;
  postFilterOption?: boolean;
  preFilterOption?: boolean;
  preFilterTitle?: string;
  productCtaText?: string;
  refinements?: any;
  rfq?: boolean;
  shareOption?: boolean;
  showFeedbackAndShare?: boolean;
  showGroup?: boolean;
  showMoreInfo?: boolean; // deprecated
  templateId?: string;
  visualSearchFilterKey?: string;
  warehouseVariant?: boolean;
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
