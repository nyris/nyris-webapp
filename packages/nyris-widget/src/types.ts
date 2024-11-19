import { Region, RectCoords, NyrisAPISettings } from '@nyris/nyris-api';
import { FeedbackStatus } from './type';

export type CadenasScriptStatus = 'ready' | 'loading' | 'failed' | 'disabled';

export enum WidgetScreen {
  Hidden = 'hidden',
  Hello = 'hello',
  Wait = 'wait',
  Fail = 'fail',
  Result = 'results',
  Refine = 'refine',
}

export interface NyrisSettings extends NyrisAPISettings {
  instantRedirectPatterns: string[];
  initiatorElementId: string | string[];
  primaryColor: string;
  cameraIconColour: string;
  browseGalleryButtonColor: string;
  customerLogo: string;
  logoWidth: string;
  ctaButtonText: string;
  language: string;
  navigatePreference: string;
  cadenasAPIKey?: string;
  cadenasCatalog?: string;
  feedback?: boolean;
  searchCriteriaLabel?: string;
  searchCriteriaKey?: string;
  filter?: { label: string; field: string }[];
}

export interface AppProps {
  image: HTMLCanvasElement;
  errorMessage: string;
  showScreen: WidgetScreen;
  thumbnailUrl: string;
  results: ResultProps[];
  regions: Region[];
  selection: RectCoords;
  showVisualSearchIcon: boolean;
  onClose: () => void;
  onRestart: () => void;
  onRefine: () => void;
  onToggle: () => void;
  onFile: (f: any, preFilter: string[]) => void;
  onFileDropped: (f: File, preFilter: string[]) => void;
  onAcceptCrop: (r: RectCoords, preFilter: string[]) => void;
  onSimilarSearch: (url: string, preFilter: string[]) => void;
  onGoBack: () => void;
  loading: boolean;
  firstSearchImage: HTMLCanvasElement;
  cadenasScriptStatus: CadenasScriptStatus;
  submitFeedback: (data: boolean) => Promise<void>;
  feedbackStatus: FeedbackStatus;
  setFeedbackStatus: (status: FeedbackStatus) => void;
  getPreFilters: () => Promise<Record<string, string[]>>;
  searchFilters: (key: any, value: string) => Promise<Record<string, string[]>>;
  selectedPreFilters?: any;
  setSelectedPreFilters?: any;
  postFilter: any;
  setPostFilter: any;
}

export interface ResultProps {
  metadata: string;
  title: string;
  sku: string;
  links: Record<string, string>;
  imageUrl: string;
  filters: Record<string, string[]>[];
}
