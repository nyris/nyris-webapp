require("blueimp-canvas-to-blob");

import {getRectAspectRatio, canvasToJpgBlob, getElementSize, getThumbSizeArea, elementToCanvas} from "./utils";
import axios, {AxiosInstance} from 'axios';

// re-export utils
export * from './utils';



export interface ImageSearchOptions {
    geoLocation?: { lat: number, lon: number, dist: number };
    cropRect?: RectCoords;
}

/**
 * Coordinates of a rectangle.
 * The distance is usually normalized to the range 0.0 to 1.0 from the top left corner.  */
export interface RectCoords {
    x1: number,
    y1: number,
    x2: number,
    y2: number
}

export type Region = {
    className?: string,
    confidence?: number,
    normalizedRect: RectCoords
}

export interface WH {
    w: number,
    h: number
}


interface SearchResponseBase {
    id: string
    session: string
    predicted_category?: { [category:string]:number }
    barcodes?: Code[]
}

/**
 * Result entry of `application/offers.nyris+json`
 */
export interface OfferNyrisResult {
    position: number,
    sku?: string,
    title?: string,
    l?: string,
    img?: { url?: string },
    // There can be also any other data
    [x: string]: any
}

export interface OfferCompleteResult {
    title: string
    description?: string
    price?: string
    links?: {
        main?: string
    }
    images: string[]
    sku: string
    score: number
}

interface OfferCompleteResponse extends SearchResponseBase {
    results: OfferCompleteResult[]
}


/**
 * Response of `application/offers.nyris+json`
 */
interface OfferNyrisResponse extends SearchResponseBase {
    durationSeconds: number
    offerInfos: OfferNyrisResult[]
}

export interface SearchResult {
    results: OfferNyrisResult[]
    requestId: string
    categoryPredictions: CategoryPrediction[]
    codes: Code[]
    duration: number
}

export interface CategoryPrediction {
    name: string
    score: number
}

export interface Code {
    value: string
    type: string
}

interface NyrisRegion {
    left: number,
    top: number,
    right: number,
    bottom: number
}

interface NyrisRegionResult {
    className: string,
    region: NyrisRegion,
    confidence: number
}


export interface RegionData {
    rect: {
        x: number,
        y: number,
        w: number,
        h: number
    }
}

export interface FeedbackData {
    success: boolean
}

export interface ClickData {
    positions: number[],
    product_ids?: string[]
}

interface SuccessEventPayload  {
    event: 'feedback',
    data: FeedbackData
}

interface RegionEventPayload {
    event: 'region',
    data: RegionData
}
interface ClickEventPayload  {
    event: 'click',
    data: ClickData
}

export type FeedbackEventPayload =
    | SuccessEventPayload
    | RegionEventPayload
    | ClickEventPayload

type FeedbackEvent = FeedbackEventPayload & {
    request_id: string,
    timestamp: Date,
    session_id: string
}

export interface NyrisAPISettings {
    xOptions: boolean | string,
    customSearchRequest?: ((file: Blob, client: any) => Promise<any>),
    responseHook?: ((response: any) => any),
    apiKey: string,
    baseUrl: string,
    jpegQuality: number,
    maxWidth: number,
    maxHeight: number,
    responseFormat?: string
}

export default class NyrisAPI {
    private readonly httpClient: AxiosInstance;
    private readonly imageMatchingUrl: string;
    private readonly cadMatchingUrl: string;
    private readonly regionProposalUrl: string;
    private readonly responseFormat: string;
    private readonly imageMatchingUrlBySku: string;
    private readonly imageMatchingSubmitManualUrl: string;
    private readonly responseHook?: ((response: any) => any);
    private readonly feedbackUrl: string;
    private readonly maxHeight: number;
    private readonly maxWidth: number;
    private readonly jpegQuality: number;
    private readonly customSearchRequest?: ((file: Blob, client: any) => Promise<any>);
    private readonly apiKey: string;
    private readonly xOptions: string| boolean;


    constructor(settings: NyrisAPISettings) {
        this.httpClient = axios.create();

        if (!settings.apiKey) {
            throw new Error("The api-key is not set.");
        }

        this.apiKey = settings.apiKey;
        const baseUrl = settings.baseUrl || 'https://api.nyris.io';
        this.imageMatchingUrl = `${baseUrl}/find/v1`;
        this.cadMatchingUrl = `${baseUrl}/cad/find/v0.1`;
        this.imageMatchingUrlBySku = `${baseUrl}/recommend/v1/`;
        this.imageMatchingSubmitManualUrl = `${baseUrl}/find/v1/manual/`;
        this.feedbackUrl = `${baseUrl}/feedback/v1/`;
        this.regionProposalUrl = `${baseUrl}/find/v1/regions/`;

        this.responseFormat = settings.responseFormat || 'application/offers.nyris+json';
        this.maxHeight = settings.maxHeight || 500;
        this.maxWidth = settings.maxWidth || 500;
        this.jpegQuality = settings.jpegQuality || 0.92;
        this.customSearchRequest = settings.customSearchRequest;
        this.responseHook = settings.responseHook;
        this.xOptions = settings.xOptions;
    }

    private async prepareImage(canvas: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement, cropRect?: RectCoords): Promise<Blob> {
        let crop = cropRect || {
            x1: 0,
            x2: 1,
            y1: 0,
            y2: 1
        };
        const originalSize = getElementSize(canvas);
        const aspectRatio = getRectAspectRatio(crop, originalSize);
        let scaledSize = getThumbSizeArea(this.maxWidth, this.maxHeight, aspectRatio);
        let resizedCroppedCanvas = elementToCanvas(canvas, scaledSize, crop);
        return await canvasToJpgBlob(resizedCroppedCanvas, this.jpegQuality);
    }

    /**
     * Search using the experimental CAD API
     * @param file - A CAD file
     * @param options - Image search options
     * @deprecated This is a prototype API and might be removed/changed at any time.
     */
    async findByCad(file: File, options: ImageSearchOptions) : Promise<SearchResult> {
        const imageBytes : Blob = file;

        let headers : any = {
            'Content-Type': file.type,
            'X-Api-Key': this.apiKey,
            'Accept-Language': 'de,*;q=0.5',
            'Accept': this.responseFormat
        };
        const xOptions = [];
        if (this.xOptions)
            xOptions.push(this.xOptions as string);
        if (xOptions.length > 0)
            headers['X-Options'] = xOptions.join(' ');
        let params = options.geoLocation ? {
            lat: options.geoLocation.lat.toString(),
            lon: options.geoLocation.lon.toString(),
            dist: options.geoLocation.dist.toString()
        } : {};
        console.log('p', params, imageBytes);
        let t1 = Date.now();
        let res = await this.httpClient.request<OfferNyrisResponse|OfferCompleteResponse>({
            method: 'POST',
            url: this.cadMatchingUrl,
            data: imageBytes,
            params,
            headers,
            responseType: 'json'
        });
        let t2 = Date.now();
        console.log(res);
        const categoryPredictions = Object.entries(res.data.predicted_category || {}).map(([name, score]) => ({
            name: name,
            score: score as number
        })).sort((a, b) => b.score - a.score);
        let codes = res.data.barcodes || [];

        let responseData : OfferNyrisResponse|OfferCompleteResponse = this.responseHook? this.responseHook(res.data) : res.data;

        let results : OfferNyrisResult[] =
            'offerInfos' in responseData ?
                responseData.offerInfos.map((r: OfferNyrisResult, i: number) => ({
                    ...r,
                    position: i
                }))
                : responseData.results.map((r: OfferCompleteResult, i: number) =>
                    ({
                        position: i,
                        sku: r.sku,
                        title: r.title,
                        img: r.images && r.images[0] ? { url: r.images[0] } : undefined,
                        l: r.links ? r.links.main : undefined,
                        p: r.price ? { vi: parseFloat(r.price) * 100, c: r.price.split(" ")[1]} : undefined
                    }));

        const requestId = res.headers["x-matching-request"];
        const duration = 'durationSeconds' in res.data ? res.data.durationSeconds : (t2-t1) / 1000;
        return { results, requestId, duration, categoryPredictions, codes };

    }

    /**
     * Search for an image.
     * @param canvas Image, Video (frame) or Canvas to use use for image search.
     * @param options See [[ImageSearchOptions]].
     */
    async findByImage(canvas: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement, options: ImageSearchOptions) : Promise<SearchResult> {
        const imageBytes = await this.prepareImage(canvas, options.cropRect);

        if (this.customSearchRequest)
            return this.customSearchRequest(imageBytes, this.httpClient);

        let headers : any = {
            'Content-Type': 'image/jpeg',
            'X-Api-Key': this.apiKey,
            'Accept-Language': 'de,*;q=0.5',
            'Accept': this.responseFormat
        };
        const xOptions = [];
        if (this.xOptions)
            xOptions.push(this.xOptions as string);
        if (xOptions.length > 0)
            headers['X-Options'] = xOptions.join(' ');
        let params = options.geoLocation ? {
            lat: options.geoLocation.lat.toString(),
            lon: options.geoLocation.lon.toString(),
            dist: options.geoLocation.dist.toString()
        } : {};
        console.log('p', params, imageBytes);
        let t1 = Date.now();
        let res = await this.httpClient.request<OfferNyrisResponse|OfferCompleteResponse>({
            method: 'POST',
            url: this.imageMatchingUrl,
            data: imageBytes,
            params,
            headers,
            responseType: 'json'
        });
        let t2 = Date.now();
        console.log(res);
        const categoryPredictions = Object.entries(res.data.predicted_category || {}).map(([name, score]) => ({
            name: name,
            score: score as number
        })).sort((a, b) => b.score - a.score);
        let codes = res.data.barcodes || [];

        let responseData : OfferNyrisResponse|OfferCompleteResponse = this.responseHook? this.responseHook(res.data) : res.data;

        let results : OfferNyrisResult[] =
            'offerInfos' in responseData ?
            responseData.offerInfos.map((r: OfferNyrisResult, i: number) => ({
                ...r,
                position: i
            }))
            : responseData.results.map((r: OfferCompleteResult, i: number) =>
                    ({
                        position: i,
                        sku: r.sku,
                        title: r.title,
                        img: r.images && r.images[0] ? { url: r.images[0] } : undefined,
                        l: r.links ? r.links.main : undefined,
                        p: r.price ? { vi: parseFloat(r.price) * 100, c: r.price.split(" ")[1]} : undefined
                    }));

        const requestId = res.headers["x-matching-request"];
        const duration = 'durationSeconds' in res.data ? res.data.durationSeconds : (t2-t1) / 1000;
        return { results, requestId, duration, categoryPredictions, codes };
    }

    /**
     * Search by SKU (itemID)
     * @param sku The SKU or ID of the item.
     * @param mid The index ID.
     */
    async findBySku(sku: string, mid: string) {
        let headers: any = {
            'Content-Type': 'image/jpeg',
            'X-Api-Key': this.apiKey,
            'Accept-Language': 'de,*;q=0.5',
            'Accept': this.responseFormat
        };
        const url = this.imageMatchingUrlBySku + encodeURIComponent(sku) + '/' + encodeURIComponent(mid);
        if (this.xOptions)
            headers['X-Options'] = this.xOptions as string;
        let r:any = await this.httpClient.get(url, {headers, responseType: 'json'})
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
    async findRegions(canvas: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement): Promise<Region[]> {
        let {w: origW, h: origH} = getElementSize(canvas);
        let scaledSize = getThumbSizeArea(this.maxWidth, this.maxHeight, origW/origH);
        let resizedCroppedCanvas = elementToCanvas(canvas, scaledSize);
        let blob = await canvasToJpgBlob(resizedCroppedCanvas, this.jpegQuality);

        const headers = {
            'Content-Type': 'image/jpeg',
            'X-Api-Key': this.apiKey
        };
        let response = await
            this.httpClient.request<NyrisRegionResult[]>({
                method: 'POST',
                url: this.regionProposalUrl,
                data: blob,
                headers
            });
        let regions :NyrisRegionResult[] = response.data;
        return regions.map(r => ({
                className: r.className,
                confidence: r.confidence,
                normalizedRect: {
                    x1: r.region.left / scaledSize.w,
                    x2: (r.region.right / scaledSize.w),
                    y1: r.region.top / scaledSize.h,
                    y2: (r.region.bottom / scaledSize.h),
                }
            }));
    }

    /**
     * Send feedback event.
     * @param sessionId ID of the session. Usually the first request ID returned.
     * @param requestId The request ID to submit the feedback event to.
     * @param payload See [[FeedbackEventPayload]].
     */
    async sendFeedback(sessionId: string, requestId: string, payload: FeedbackEventPayload) {
        const headers = {
            'X-Api-Key': this.apiKey,
            'Content-Type': 'application/json'
        };
        const data : FeedbackEvent = {
            request_id: requestId,
            timestamp: new Date(),
            session_id: sessionId,
            ...payload
        };
        await this.httpClient.request({
            method: 'POST',
            url: this.feedbackUrl,
            headers,
            data
        });
    }
}



