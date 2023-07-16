/**
 * Coordinates of a rectangle.
 * The distance is usually normalized to the range 0.0 to 1.0 from the top left corner.  */
export interface RectCoords {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export type Region = {
  classId?: string;
  confidence?: number;
  normalizedRect: RectCoords;
};

export interface WH {
  w: number;
  h: number;
}

export interface SearchResult {
  results: OfferNyrisResult[];
  requestId: string;
  categoryPredictions: CategoryPrediction[];
  codes: Code[];
  duration: number;
}

export interface ImageSearchOptions {
  geoLocation?: { lat: number; lon: number; dist: number };
  cropRect?: RectCoords;
}
export interface RegionData {
  rect: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface Filter {
  key?: string;
  values: string[];
}

export interface FeedbackData {
  success: boolean;
}

export interface ClickData {
  positions: number[];
  product_ids?: string[];
}

interface SuccessEventPayload {
  event: "feedback";
  data: FeedbackData;
}

interface RegionEventPayload {
  event: "region";
  data: RegionData;
}
interface ClickEventPayload {
  event: "click";
  data: ClickData;
}

interface ConversionEventPayload {
  event: "conversion";
  data: ClickData;
}

export type FeedbackEventPayload =
  | SuccessEventPayload
  | RegionEventPayload
  | ClickEventPayload
  | ConversionEventPayload;

export type FeedbackEvent = FeedbackEventPayload & {
  request_id: string;
  timestamp: Date;
  session_id: string;
};
export interface CategoryPrediction {
  name: string;
  score: number;
}

export interface Code {
  value: string;
  type: string;
}

/**
 * Result entry of `application/offers.nyris+json`
 */
export interface OfferNyrisResult {
  position: number;
  sku?: string;
  title?: string;
  l?: string;
  img?: { url?: string };
  // There can be also any other data
  [x: string]: any;
}
