import {
  CategoryPrediction,
  FeedbackEvent,
  FeedbackEventPayload,
  ImageSearchOptions,
  Region,
  SearchResult,
  RectCoords,
  Filter,
} from "./types-external";

require("blueimp-canvas-to-blob");

import {
  getRectAspectRatio,
  canvasToJpgBlob,
  getElementSize,
  getThumbSizeArea,
  elementToCanvas,
  timePromise,
} from "./utils";
import axios, { AxiosInstance, AxiosResponse } from "axios";

// re-export utils
export * from "./utils";
// and export types
export * from "./types-external";

import {
  CategoryPredictionResponse,
  NyrisRegionResult,
} from "./types-internal";

export interface NyrisAPISettings {
  xOptions: boolean | string;
  customSearchRequest?: (file: Blob, client: any) => Promise<any>;
  responseHook?: (response: any) => any;
  apiKey: string;
  baseUrl: string;
  jpegQuality: number;
  maxWidth: number;
  maxHeight: number;
  responseFormat?: string;
}

export default class NyrisAPI {
  private readonly httpClient: AxiosInstance;
  private readonly imageMatchingUrl: string;
  private readonly cadMatchingUrl: string;
  private readonly regionProposalUrl: string;
  private readonly responseFormat: string;
  private readonly imageMatchingUrlBySku: string;
  private readonly imageMatchingSubmitManualUrl: string;
  private readonly responseHook?: (response: any) => any;
  private readonly feedbackUrl: string;
  private readonly maxHeight: number;
  private readonly maxWidth: number;
  private readonly jpegQuality: number;
  private readonly customSearchRequest?: (
    file: Blob,
    client: any
  ) => Promise<any>;
  private readonly apiKey: string;
  private readonly xOptions: string | boolean;
  private readonly findFilters: string;

  constructor(settings: NyrisAPISettings) {
    this.httpClient = axios.create();

    if (!settings.apiKey) {
      throw new Error("The api-key is not set.");
    }

    this.apiKey = settings.apiKey;
    const baseUrl = settings.baseUrl || "https://api.nyris.io";
    this.imageMatchingUrl = `${baseUrl}/find/v1.1`;
    this.cadMatchingUrl = `${baseUrl}/cad/find/v0.1`;
    this.imageMatchingUrlBySku = `${baseUrl}/recommend/v1/`;
    this.imageMatchingSubmitManualUrl = `${baseUrl}/find/v1/manual/`;
    this.feedbackUrl = `${baseUrl}/feedback/v1/`;
    this.regionProposalUrl = `${baseUrl}/find/v2/regions/`;
    this.findFilters = `${baseUrl}/find/v1/filters`;

    this.responseFormat =
      settings.responseFormat || "application/offers.complete+json";
    this.maxHeight = settings.maxHeight || 500;
    this.maxWidth = settings.maxWidth || 500;
    this.jpegQuality = settings.jpegQuality || 0.92;
    this.customSearchRequest = settings.customSearchRequest;
    this.responseHook = settings.responseHook;
    this.xOptions = settings.xOptions;
  }

  private async prepareImage(
    canvas: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement,
    cropRect?: RectCoords
  ): Promise<Blob> {
    let crop = cropRect || {
      x1: 0,
      x2: 1,
      y1: 0,
      y2: 1,
    };
    const originalSize = getElementSize(canvas);
    const aspectRatio = getRectAspectRatio(crop, originalSize);
    let scaledSize = getThumbSizeArea(
      this.maxWidth,
      this.maxHeight,
      aspectRatio
    );
    let resizedCroppedCanvas = elementToCanvas(canvas, scaledSize, crop);
    return await canvasToJpgBlob(resizedCroppedCanvas, this.jpegQuality);
  }

  private getSearchRequestHeaders(contentType?: string) {
    // Create headers
    let headers: any = {
      "X-Api-Key": this.apiKey,
      "Accept-Language": "de,*;q=0.5",
      Accept: this.responseFormat,
      "Content-Type": contentType || "application/octet-stream",
    };

    // Add options
    const xOptions = [];
    if (this.xOptions) xOptions.push(this.xOptions as string);
    if (xOptions.length > 0) headers["X-Options"] = xOptions.join(" ");

    return headers;
  }

  private getRegionRequestHeaders(contentType?: string) {
    // Create headers
    let headers: any = {
      "X-Api-Key": this.apiKey,
      "Content-Type": contentType || "application/octet-stream",
    };

    // Add options
    const xOptions = [];
    if (this.xOptions) xOptions.push(this.xOptions as string);
    if (xOptions.length > 0) headers["X-Options"] = xOptions.join(" ");

    return headers;
  }

  private getParams(options: ImageSearchOptions) {
    let params: any = options.geoLocation
      ? {
          lat: options.geoLocation.lat.toString(),
          lon: options.geoLocation.lon.toString(),
          dist: options.geoLocation.dist.toString(),
        }
      : {};
    params = { ...params, text: options.text };
    return params;
  }

  private parseCategoryPredictions(
    categoryPredictionResponse?: CategoryPredictionResponse
  ): CategoryPrediction[] {
    return Object.entries(categoryPredictionResponse || {})
      .map(([name, score]) => ({
        name: name,
        score: score as number,
      }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Search using the experimental CAD API
   * @param file - A CAD file
   * @param options - Image search options
   * @deprecated This is a prototype API and might be removed/changed at any time.
   */
  async findByCad(
    file: File,
    options: ImageSearchOptions
  ): Promise<SearchResult> {
    let fileType = file.type;
    let headers = this.getSearchRequestHeaders(fileType);
    let params = this.getParams(options);
    let { res }: any = await timePromise(
      this.httpClient.request<SearchResult>({
        method: "POST",
        url: this.cadMatchingUrl,
        data: file,
        params,
        headers,
        responseType: "json",
      })
    );
    return res.data;
  }

  /**
   * Search for an image.
   * @param canvas Image, Video (frame) or Canvas to use use for image search.
   * @param filters key values of filters
   * @param options See [[ImageSearchOptions]].
   */
  async find(
    options: ImageSearchOptions,
    canvas?: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement,
    filters?: Filter[]
  ): Promise<SearchResult> {
    var requestBody = new FormData();
    let params = {};
    let headers = this.getSearchRequestHeaders("image/jpeg");
    if (canvas && options.text) {
      requestBody.append("text", options.text);
      const { text, ...rest } = options;
      params = this.getParams(rest);
    } else if (options.text && filters && filters.length > 0) {
      requestBody.append("text", options.text);
    } else {
      params = this.getParams(options);
    }

    if (canvas) {
      const imageBytes = await this.prepareImage(canvas, options.cropRect);
      if (this.customSearchRequest)
        return this.customSearchRequest(imageBytes, this.httpClient);
      requestBody.append("image", imageBytes);
    }

    if (filters && filters.length > 0) {
      for (let i = 0; i < filters.length; i++) {
        requestBody.append(`filters[${i}].filterType`, filters[i].key!);
        for (let j = 0; j < filters[i].values.length; j++) {
          requestBody.append(
            `filters[${i}].filterValues[${j}]`,
            filters[i].values[j]
          );
        }
      }
    }

    let { res }: any = await timePromise(
      this.httpClient.request<SearchResult>({
        method: "POST",
        url: this.imageMatchingUrl,
        params,
        headers,
        responseType: "json",
        ...(canvas || (filters && filters.length)
          ? { data: requestBody }
          : { data: null }),
      })
    );

    return res.data;
  }

  /**
   * Search by SKU (itemID)
   * @param sku The SKU or ID of the item.
   * @param mid The index ID.
   */
  async findBySku(sku: string, mid: string) {
    const headers = this.getSearchRequestHeaders();
    const url = `${this.imageMatchingUrlBySku}${encodeURIComponent(
      sku
    )}/${encodeURIComponent(mid)}`;
    let r: any = await this.httpClient.get(url, {
      headers,
      responseType: "json",
    });
    if (this.responseHook) {
      r = this.responseHook;
    }
    return r;
  }

  /**
   * Find significant sections in the image.
   * @param canvas Canvas, video or image to search with.
   * @returns A list of regions, see [[Region]].
   */
  async findRegions(
    canvas: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement
  ): Promise<Region[]> {
    let { w: origW, h: origH } = getElementSize(canvas);
    let scaledSize = getThumbSizeArea(
      this.maxWidth,
      this.maxHeight,
      origW / origH
    );
    let resizedCroppedCanvas = elementToCanvas(canvas, scaledSize);
    let blob = await canvasToJpgBlob(resizedCroppedCanvas, this.jpegQuality);

    let headers = this.getRegionRequestHeaders("image/jpeg");
    let response = await this.httpClient.request<{
      regions: NyrisRegionResult[];
    }>({
      method: "POST",
      url: this.regionProposalUrl,
      data: blob,
      headers,
    });
    let regions: NyrisRegionResult[] = response.data.regions;
    return regions.map((r) => ({
      classId: r.classId,
      confidence: r.confidence,
      normalizedRect: {
        x1: r.region.left / scaledSize.w,
        x2: r.region.right / scaledSize.w,
        y1: r.region.top / scaledSize.h,
        y2: r.region.bottom / scaledSize.h,
      },
    }));
  }

  /**
   * Send feedback event.
   * @param sessionId ID of the session. Usually the first request ID returned.
   * @param requestId The request ID to submit the feedback event to.
   * @param payload See [[FeedbackEventPayload]].
   */
  async sendFeedback(
    sessionId: string,
    requestId: string,
    payload: FeedbackEventPayload
  ) {
    const headers = {
      "X-Api-Key": this.apiKey,
      "Content-Type": "application/json",
    };
    const data: FeedbackEvent = {
      request_id: requestId,
      timestamp: new Date(),
      session_id: sessionId,
      ...payload,
    };
    await this.httpClient.request({
      method: "POST",
      url: this.feedbackUrl,
      headers,
      data,
    });
  }

  async getFilters(limit: number): Promise<Filter[]> {
    let headers = this.getSearchRequestHeaders();
    const url = `${this.findFilters}?limit=${limit}`;
    let response = await this.httpClient.get<Filter[]>(url, {
      headers,
      responseType: "json",
    });
    return response.data;
  }

  async searchFilters(
    key: string,
    value: string,
    limit: number = 100
  ): Promise<string[]> {
    let headers = this.getSearchRequestHeaders();
    const url = `${this.findFilters}/${key}/${value}?limit=${limit}`;
    let response = await this.httpClient.get<string[]>(url, {
      headers,
      responseType: "json",
    });

    return response.data;
  }
}
