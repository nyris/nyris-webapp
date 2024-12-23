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

export interface Support {
  enabled?: boolean;
  description?: string;
  emailInquiry?: boolean;
  supportNumber?: string;
  emailTemplateId?: string;
}

export interface Rfq {
  enabled?: boolean;
  emailTemplateId?: string;
}
export interface Cadenas {
  cadenas3dWebView?: boolean;
  cadenasAPIKey?: string;
  catalog?: string;
}
export interface Field {
  ctaLinkField: string;
  secondaryCTALinkField?: string;
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
  isBrandNameTitleVisible?: boolean;
  cadenas?: Cadenas;
  CTAButtonText?: string;
  secondaryCTAButtonText?: string;
  field: Field;
  headerText?: string;
  instantRedirectPatterns: string[];
  itemIdLabel?: string;
  language?: string;
  noImageUrl?: string;
  postFilterOption?: boolean;
  preFilterOption?: boolean;
  preFilterTitle?: string;
  preview: boolean;
  refinements?: any;
  regions: boolean;
  rfq?: Rfq;
  shareOption?: boolean;
  showFeedback?: boolean;
  showFeedbackAndShare?: boolean;
  showGroup?: boolean;
  showPoweredByNyris?: boolean;
  support?: Support;
  theme: SearchSuiteSettings;
  visualSearchFilterKey?: string;
  warehouseVariant?: boolean;
  shouldUseUserMetadata?: boolean;
  experienceVisualSearch?: boolean;
  experienceVisualSearchImages?: string[];
}

export interface SearchSuiteSettings {
  appBarLogoUrl?: string;
  headerColor?: string;
  logoHeight?: string;
  logoWidth?: string;
  mobileFooterImageColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  secondaryCTAButtonColor?: string;
  CTAButtonColor?: string;
  CTAButtonTextColor?: string;
  mainTextColor?: string;
  brandFieldBackground?: string;
  brandFieldPadding?: string;
}

export type AppState = {
  search: SearchState;
  settings: AppSettings;
};

export interface CanvasWithId {
  canvas: HTMLCanvasElement;
  id: string;
}
