import {
    CategoryPrediction, FeedbackEvent,
    FeedbackEventPayload,
    ImageSearchOptions,
    OfferNyrisResult,
    Region,
    SearchResult,
    RectCoords
} from "./types-external";

require("blueimp-canvas-to-blob");

import {getRectAspectRatio, canvasToJpgBlob, getElementSize, getThumbSizeArea, elementToCanvas, timePromise} from "./utils";
import axios, {AxiosInstance, AxiosResponse} from 'axios';

// re-export utils
export * from './utils';
// and export types
export * from './types-external';

import {
    CategoryPredictionResponse, NyrisRegionResult,
    OfferCompleteResponse,
    OfferCompleteResult,
    OfferNyrisResponse
} from './types-internal';



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

    private getSearchRequestHeaders(contentType?: string) {
        // Create headers
        let headers : any = {
            'X-Api-Key': this.apiKey,
            'Accept-Language': 'de,*;q=0.5',
            'Accept': this.responseFormat
        };

        // Add content type if provided
        if (contentType)
            headers['Content-Type'] = contentType;

        // Add options
        const xOptions = [];
        if (this.xOptions)
            xOptions.push(this.xOptions as string);
        if (xOptions.length > 0)
            headers['X-Options'] = xOptions.join(' ');

        return headers;
    };

    private getParams(options: ImageSearchOptions) {
        let params = options.geoLocation ? {
            lat: options.geoLocation.lat.toString(),
            lon: options.geoLocation.lon.toString(),
            dist: options.geoLocation.dist.toString()
        } : {};

        return params;
    }

    private parseCategoryPredictions(categoryPredictionResponse?: CategoryPredictionResponse) : CategoryPrediction[] {
        return Object.entries(categoryPredictionResponse || {}).map(([name, score]) => ({
            name: name,
            score: score as number
        })).sort((a, b) => b.score - a.score);
    }


    private parseSearchResult(res: AxiosResponse<OfferNyrisResponse|OfferCompleteResponse>, durationSeconds: number) {
        const categoryPredictions = this.parseCategoryPredictions(res.data.predicted_category);
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
        const duration = 'durationSeconds' in res.data ? res.data.durationSeconds : durationSeconds;
        return { results, requestId, duration, categoryPredictions, codes };
    }

    /**
     * Search using the experimental CAD API
     * @param file - A CAD file
     * @param options - Image search options
     * @deprecated This is a prototype API and might be removed/changed at any time.
     */
    async findByCad(file: File, options: ImageSearchOptions) : Promise<SearchResult> {
        let headers = this.getSearchRequestHeaders(file.type);
        let params = this.getParams(options);
        let { res, durationSeconds } = await timePromise(this.httpClient.request<OfferNyrisResponse|OfferCompleteResponse>({
            method: 'POST',
            url: this.cadMatchingUrl,
            data: file,
            params,
            headers,
            responseType: 'json'
        }));
        return this.parseSearchResult(res, durationSeconds);
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

        let headers = this.getSearchRequestHeaders('image/jpeg');
        let params = this.getParams(options);

        let { res, durationSeconds } = await timePromise(this.httpClient.request<OfferNyrisResponse|OfferCompleteResponse>({
            method: 'POST',
            url: this.imageMatchingUrl,
            data: imageBytes,
            params,
            headers,
            responseType: 'json'
        }));

        return this.parseSearchResult(res, durationSeconds);
    }

    /**
     * Search by SKU (itemID)
     * @param sku The SKU or ID of the item.
     * @param mid The index ID.
     */
    async findBySku(sku: string, mid: string) {
        const headers = this.getSearchRequestHeaders();
        const url = `${this.imageMatchingUrlBySku}${encodeURIComponent(sku)}/${encodeURIComponent(mid)}`;
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



