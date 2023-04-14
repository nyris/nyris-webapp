import { NyrisAPISettings } from '@nyris/nyris-api';
import { NyrisAppState } from 'Store/nyris/types';
import { SearchState } from 'Store/search/types';

export interface AlgoliaSettings {
  apiKey: string;
  appId: string;
  indexName: string;
}

export interface AppSettings extends NyrisAPISettings {
  exampleImages: string[];
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
  preFilterOption?: boolean;
  warehouseVariant?: boolean;
  preFilterTitle?: string;
  postFilterOption?: boolean;
  showFeedbackAndShare?: boolean;
  showMoreInfo?: boolean;
  visualSearchFilterKey?: string;
  alogoliaFilterField?: string;
  headerText?: string;
  brandName?: string;
  shareOption?: boolean;
  language?: string;
  itemIdLabel?: string;
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
