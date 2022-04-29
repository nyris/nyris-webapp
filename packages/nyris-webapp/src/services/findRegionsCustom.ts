import {
  ImageSearchOptions,
  Region,
  Result,
  SearchServiceSettings,
} from "./types";
// import {canvasToJpgBlob, getElementSize, getThumbSizeArea, toCanvas} from "./nyris";
import axios, { AxiosInstance } from "axios";
import {
  canvasToJpgBlob,
  getElementSize,
  getThumbSizeArea,
  toCanvas,
} from "./nyris";

export interface RegionData {
  rect: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

interface SearchResult {
  results: Result[];
  requestId: string;
  categoryPredictions: any[];
  codes: any[];
  duration: number;
}

export default class NyrisAPICT {
  private readonly httpClient: AxiosInstance;
  private readonly imageMatchingUrl: string;
  private readonly regionProposalUrl: string;
  private readonly responseFormat: string;
  private imageMatchingUrlBySku: string;
  private imageMatchingSubmitManualUrl: string;
  private feedbackUrl: string;

  constructor(private settings: SearchServiceSettings) {
    this.httpClient = axios.create();
    this.imageMatchingUrl =
      this.settings.imageMatchingUrl || "https://api.nyris.io/find/v1";
    this.imageMatchingUrlBySku =
      this.settings.imageMatchingUrlBySku ||
      "https://api.nyris.io/recommend/v1/";
    this.imageMatchingSubmitManualUrl =
      this.settings.imageMatchingSubmitManualUrl ||
      "https://api.nyris.io/find/v1/manual/";
    this.feedbackUrl =
      this.settings.feedbackUrl || "https://api.nyris.io/feedback/v1/";
    this.regionProposalUrl =
      this.settings.regionProposalUrl ||
      "https://api.nyris.io/find/v1/regions/";
    this.responseFormat =
      this.settings.responseFormat || "application/offers.nyris+json";
  }

  /**
   * Find significant sections in the image.
   * @param canvas Canvas, video or image to search with.
   * @param options See [[ImageSearchOptions]].
   * @returns A list of regions, see [[Region]].
   */
  async findRegions(
    canvas: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement,
    options: ImageSearchOptions
  ): Promise<Region[]> {
    let [origW, origH] = getElementSize(canvas);
    let { w: scaledW, h: scaledH } = getThumbSizeArea(
      options.maxWidth,
      options.maxHeight,
      origW,
      origH
    );
    let resizedCroppedCanvas = toCanvas(canvas, { w: scaledW, h: scaledH });
    let blob = await canvasToJpgBlob(resizedCroppedCanvas, options.jpegQuality);

    const headers = {
      "Content-Type": "image/jpeg",
      "X-Api-Key": this.settings.apiKey,
    };
    let response = await this.httpClient.request<any[]>({
      method: "POST",
      url: this.regionProposalUrl,
      data: blob,
      headers,
    });
    let regions: any[] = response.data;
    return regions.map((r) => ({
      className: r.className,
      confidence: r.confidence,
      x1: r.region.left / scaledW,
      x2: r.region.right / scaledW,
      y1: r.region.top / scaledH,
      y2: r.region.bottom / scaledH,
    }));
  }

  private async prepareImage(
    canvas: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement,
    options: ImageSearchOptions
  ): Promise<{ bytes: Blob; region?: RegionData }> {
    let [w, h] = getElementSize(canvas);
    let crop = options.crop
      ? options.crop
      : {
          x: 0,
          y: 0,
          w: w,
          h: h,
        };
    let region: RegionData | undefined = undefined;
    if (options.crop) {
      region = {
        rect: {
          w: Math.min(1, crop.w / w),
          h: Math.min(1, crop.h / h),
          x: Math.min(1, crop.x / w),
          y: Math.min(1, crop.y / h),
        },
      };
    }
    let scaledSize = getThumbSizeArea(
      options.maxWidth,
      options.maxHeight,
      crop.w,
      crop.h
    );
    let resizedCroppedCanvas = toCanvas(canvas, scaledSize, undefined, crop);
    let bytes = await canvasToJpgBlob(
      resizedCroppedCanvas,
      options.jpegQuality
    );

    return { bytes, region };
  }

  async findByImage(
    canvas: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement,
    options: ImageSearchOptions
  ): Promise<SearchResult> {
    const image = await this.prepareImage(canvas, options);

    if (this.settings.customSearchRequest)
      return this.settings.customSearchRequest(image.bytes, this.httpClient); // TODO check if the interface is ok for hooks

    let headers: any = {
      "Content-Type": "image/jpeg",
      "X-Api-Key": this.settings.apiKey,
      "Accept-Language": "de,*;q=0.5",
      Accept: this.responseFormat,
    };
    const xOptions = [];
    if (this.settings.xOptions) xOptions.push(this.settings.xOptions as string);
    if (options.useRecommendations) xOptions.push("+recommendations");
    if (xOptions.length > 0) headers["X-Options"] = xOptions.join(" ");
    let params = options.geoLocation
      ? {
          lat: options.geoLocation.lat.toString(),
          lon: options.geoLocation.lon.toString(),
          dist: options.geoLocation.dist.toString(),
        }
      : {};
    // console.log("p", params, image.bytes);
    let res: any = await this.httpClient.request<any>({
      method: "POST",
      url: this.imageMatchingUrl,
      data: image.bytes,
      params,
      headers,
      responseType: "json",
    });
    // console.log(res);
    const categoryPredictions = Object.entries(
      res.data.predicted_category || {}
    )
      .map(([name, score]) => ({
        name: name,
        score: score as number,
      }))
      .sort((a, b) => b.score - a.score);
    let codes = res.data.barcodes || [];

    let responseData = this.settings.responseHook
      ? this.settings.responseHook(res.data)
      : res.data;

    let results: Result[] = responseData?.results.map(
      (r: Result, i: number) => ({
        ...r,
        position: i,
      })
    );
    const requestId = res.headers["x-matching-request"];
    const duration = res.data.durationSeconds;
    return { results, requestId, duration, categoryPredictions, codes };
  }

  async createSession(): Promise<{ data: any }> {
    let headers: any = {
      "X-Api-Key": this.settings.apiKey,
    };
    return await this.httpClient.request({
      method: "POST",
      url: `${this.imageMatchingUrl}/session`,
      headers,
    });
  }
}
