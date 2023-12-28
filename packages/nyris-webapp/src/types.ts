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
  supportEmail?: string;
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
  algolia: AlgoliaSettings;
  alogoliaFilterField?: string;
  appTitle?: string;
  auth0: Auth0Settings;
  brandName?: string;
  cadenas3dWebView?: boolean;
  cadenasAPIKey?: string;
  cadSearch?: boolean;
  catalog?: string;
  exampleImages?: string[]; // deprecated
  field: Field;
  headerText?: string;
  inquiry?: boolean;
  instantRedirectPatterns: string[];
  itemIdLabel?: string;
  language?: string;
  noImageUrl?: string;
  postFilterOption?: boolean;
  preFilterOption?: boolean;
  preFilterTitle?: string;
  preview: boolean;
  productCtaText?: string;
  refinements?: any;
  regions: boolean;
  rfq?: boolean;
  shareOption?: boolean;
  showFeedbackAndShare?: boolean;
  showFeedback?: boolean;
  showGroup?: boolean;
  showMoreInfo?: boolean; // deprecated
  showPoweredByNyris?: boolean;
  templateId?: string;
  theme: SearchSuiteSettings;
  visualSearchFilterKey?: string;
  warehouseVariant?: boolean;
}

export interface SearchSuiteSettings {
  appBarLogoUrl?: string;
  headerColor?: string;
  logoHeight?: string;
  logoWidth?: string;
  mobileFooterImageColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export type AppState = {
  search: SearchState;
  settings: AppSettings;
};

export interface CanvasWithId {
  canvas: HTMLCanvasElement;
  id: string;
}
