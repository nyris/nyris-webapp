import { NyrisAPISettings } from '@nyris/nyris-api';
import { NyrisAppState } from 'Store/Nyris';
import { SearchState } from 'Store/Search';

export interface MDSettings {
  customFontFamily?: string;
  appBarLogoUrl: string;
  appBarTitle: string;
  appBarCustomBackgroundColor?: string;
  appBarCustomTextColor?: string;

  primaryColor: string;
  secondaryColor: string;
  resultFirstRowProperty: string;
  resultSecondRowProperty: string;

  resultLinkText?: string;
  resultLinkIcon?: string;
  active?: boolean;
}

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
  resultTemplate?: string;
  regions: boolean;
  instantRedirectPatterns: string[];
  themePage: ThemeChoice;
  algolia?: AlgoliaSettings;
  moreInfoText?: string;
  refinements?: any;
  preFilterOption?: boolean;
  filterType?: string;
  headerText?: string;
}

export interface DefaultThemeSettings {
  active: boolean;
}

export interface SearchSuiteSettings {
  active?: boolean;
  moreInfoText: string;
  appBarLogoUrl: string;
  appBarLogoUrlAlt: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface ThemeChoice {
  default?: DefaultThemeSettings;
  materialDesign?: MDSettings;
  searchSuite?: SearchSuiteSettings;
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

export interface SearchServiceSettings {
  xOptions: boolean | string;
  customSearchRequest?: (file: Blob, client: any) => Promise<any>;
  responseHook?: (response: any) => any;
  apiKey: string;
  imageMatchingUrl?: string;
  imageMatchingUrlBySku?: string;
  imageMatchingSubmitManualUrl?: string;
  regionProposalUrl?: string;
  responseFormat?: string;
  feedbackUrl?: string;
  exampleImages: string[];
  resultTemplate?: string;
  noImageUrl?: string;
  materialDesign?: MDSettings;
  preview: boolean;
  regions: boolean;
  jpegQuality: number;
  maxWidth: number;
  maxHeight: number;
  useRecommendations: boolean;
}

export interface AlgoliaResult {
  sku: string;
}
