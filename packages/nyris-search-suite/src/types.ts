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

export interface AppSettings extends NyrisAPISettings {
  algolia: AlgoliaSettings;
  alogoliaFilterField?: string;
  appTitle?: string;
  auth0: Auth0Settings;
  brandName?: string;
  cadenas?: Cadenas;
  clarityId?: string;
  mainTitle: string;
  productDetails: string;
  secondaryTitle: string;
  CTAButton?: CTAButtonSettings;
  secondaryCTAButton?: SecondaryCTAButton;
  attributes?: Attributes;
  experienceVisualSearch?: boolean;
  experienceVisualSearchImages?: string[];
  headerText?: string;
  instantRedirectPatterns: string[];
  isBrandNameTitleVisible?: boolean;
  language?: string;
  multiImageSearch?: boolean;
  noImageUrl?: string;
  noSimilarSearch?: boolean;
  postFilterOption?: boolean;
  preFilterOption?: boolean;
  preFilterTitle?: string;
  preview: boolean;
  cadSearch?: boolean;
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
  support: Support;
  theme: SearchSuiteSettings;
  visualSearchFilterKey?: string;
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
