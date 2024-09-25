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
  productAttributes?: boolean;
  labelsAttributes?: boolean,
  attributeOneLabelValue?: string,
  attributeOneValue?: string,
  attributeTwoLabelValue?: string,
  attributeTwoValue?: string,
  attributeThreeLabelValue?: string,
  attributeThreeValue?: string,
  attributeFourLabelValue?: string,
  attributeFourValue?: string,
}
interface CTAButtonSettings {
  CTAButton?: boolean,
  CTAButtonText?: string,
  CTAButtonTextColor?: string,
  CTAButtonColor?: string,
  CTAIcon?: string,
  CTAIconSource?: string,
  CTALinkField?: string,
}

export interface AppSettings extends NyrisAPISettings {
  algolia: AlgoliaSettings;
  alogoliaFilterField?: string;
  appTitle?: string;
  auth0: Auth0Settings;
  brandName?: string;
  cadenas?: Cadenas;
  clarityId?: string;
  CTAButton?: CTAButtonSettings;
  experienceVisualSearch?: boolean;
  experienceVisualSearchImages?: string[];
  field: Field;
  headerText?: string;
  instantRedirectPatterns: string[];
  isBrandNameTitleVisible?: boolean;
  itemIdLabel?: string;
  language?: string;
  multiImageSearch?: boolean;
  noImageUrl?: string;
  noSimilarSearch?: boolean;
  postFilterOption?: boolean;
  preFilterOption?: boolean;
  preFilterTitle?: string;
  preview: boolean;
  refinements?: any;
  regions: boolean;
  rfq?: Rfq;
  secondaryCTAButtonText?: string;
  shareOption?: boolean;
  shouldUseUserMetadata?: boolean;
  showFeedback?: boolean;
  showFeedbackAndShare?: boolean;
  showGroup?: boolean;
  showPoweredByNyris?: boolean;
  simpleCardView?: boolean;
  support?: Support;
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
