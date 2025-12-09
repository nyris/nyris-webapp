import { NyrisAPISettings } from '@nyris/nyris-api';

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
  prefilterFieldName?: string;
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
  productDetails: string;
}
interface CTAButtonSettings {
  CTAButton?: boolean;
  CTAButtonText?: string;
  CTAButtonTextColor?: string;
  CTAButtonColor?: string;
  CTAIcon?: boolean;
  CTALinkField?: string;
}

interface SecondaryCTAButton {
  secondaryCTAButton?: boolean;
  secondaryCTAButtonText?: string;
  secondaryCTAButtonTextColor?: string;
  secondaryCTAButtonColor?: string;
  secondaryCTAIcon?: boolean;
  secondaryCTALinkField?: string;
}

interface Attributes {
  productAttributes?: boolean;
  attributeOneLabelValue?: string;
  attributeOneValue?: string;
  attributeTwoLabelValue?: string;
  attributeTwoValue?: string;
  attributeThreeLabelValue?: string;
  attributeThreeValue?: string;
  attributeFourLabelValue?: string;
  attributeFourValue?: string;
}

interface ProductDetailsAttribute {
  propertyName: string;
  value: string;
}
export interface AppSettings extends NyrisAPISettings {
  algolia: AlgoliaSettings;
  alogoliaFilterField?: string;
  appTitle?: string;
  attributes?: Attributes;
  auth0: Auth0Settings;
  brandName?: string;
  cadenas?: Cadenas;
  cadSearch?: boolean;
  clarityId?: string;
  CTAButton?: CTAButtonSettings;
  experienceVisualSearch?: boolean;
  experienceVisualSearchImages?: string[];
  headerText?: string;
  instantRedirectPatterns: string[];
  isBrandNameTitleVisible?: boolean;
  language?: string;
  mainTitle: string;
  multiImageSearch?: boolean;
  noImageUrl?: string;
  noSimilarSearch?: boolean;
  postFilterOption?: boolean;
  preFilterOption?: boolean;
  preFilterTitle?: string;
  preview: boolean;
  productDetails: string;
  productDetailsAttribute?: ProductDetailsAttribute[];
  refinements?: any;
  regions: boolean;
  rfq?: Rfq;
  secondaryCTAButton?: SecondaryCTAButton;
  secondaryCTAButtonText?: string;
  secondaryTitle: string;
  shareOption?: boolean;
  shouldUseUserMetadata?: boolean;
  showFeedback?: boolean;
  showFeedbackAndShare?: boolean;
  showGroup?: boolean;
  showPoweredByNyris?: boolean;
  simpleCardView?: boolean;
  support: Support;
  theme: SearchSuiteSettings;
  geoLocation?: boolean;
  geoLocationMessage?: string;
  visualSearchFilterKey?: string;
  showImageDetails?: boolean;
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
export interface CanvasWithId {
  canvas: HTMLCanvasElement;
  id: string;
}

declare global {
  interface Window {
    settings: AppSettings;
  }
}

export type CadenasScriptStatus = 'ready' | 'loading' | 'failed' | 'disabled';
