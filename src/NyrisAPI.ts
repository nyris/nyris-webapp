import {ImageSearchOptions, Region, Result, SearchServiceSettings} from "./types";
import {canvasToJpgBlob, getElementSize, getThumbSizeArea, toCanvas} from "./nyris";
import axios, {AxiosInstance} from 'axios';

interface SearchResult {
    results: Result[]
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

export default class NyrisAPI {
    private readonly httpClient: AxiosInstance;
    private readonly imageMatchingUrl: string;
    private readonly regionProposalUrl: string;
    private readonly responseFormat: string;
    private imageMatchingUrlBySku: string;
    private imageMatchingSubmitManualUrl: string;
    private feedbackUrl: string;

    constructor(private settings: SearchServiceSettings) {
        this.httpClient = axios.create();
        this.imageMatchingUrl = this.settings.imageMatchingUrl || 'https://api.nyris.io/find/v1';
        this.imageMatchingUrlBySku = this.settings.imageMatchingUrlBySku || 'https://api.nyris.io/recommend/v1/';
        this.imageMatchingSubmitManualUrl = this.settings.imageMatchingSubmitManualUrl || 'https://api.nyris.io/find/v1/manual/';
        this.feedbackUrl = this.settings.feedbackUrl || 'https://api.nyris.io/feedback/v1/';
        this.regionProposalUrl = this.settings.regionProposalUrl || 'https://api.nyris.io/find/v1/regions/';
        this.responseFormat = this.settings.responseFormat || 'application/offers.nyris+json';
    }

    private async prepareImage(canvas: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement, options: ImageSearchOptions): Promise<{bytes: Blob, region?: RegionData}> {
        let [w, h] = getElementSize(canvas);
        let crop = options.crop ? options.crop : {
            x: 0,
            y: 0,
            w: w,
            h: h
        };
        let region: RegionData|undefined = undefined;
        if (options.crop){
            region = {
                rect:{
                    w: Math.min(1, crop.w / w),
                    h: Math.min(1, crop.h / h),
                    x: Math.min(1, crop.x / w),
                    y: Math.min(1, crop.y / h)
                }
            };
        }
        let scaledSize = getThumbSizeArea(options.maxWidth, options.maxHeight, crop.w, crop.h);
        let resizedCroppedCanvas = toCanvas(canvas, scaledSize, undefined, crop);
        let bytes = await canvasToJpgBlob(resizedCroppedCanvas, options.jpegQuality);

        return {bytes, region};
    }

    /**
     * Search for an image.
     * @param canvas Image, Video (frame) or Canvas to use use for image search.
     * @param options See [[ImageSearchOptions]].
     */
    async findByImage(canvas: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement, options: ImageSearchOptions) : Promise<SearchResult> {
        const image = await this.prepareImage(canvas, options);

        if (this.settings.customSearchRequest)
            return this.settings.customSearchRequest(image.bytes, this.httpClient); // TODO check if the interface is ok for hooks

        let headers : any = {
            'Content-Type': 'image/jpeg',
            'X-Api-Key': this.settings.apiKey,
            'Accept-Language': 'de,*;q=0.5',
            'Accept': this.responseFormat
        };
        const xOptions = [];
        if (this.settings.xOptions)
            xOptions.push(this.settings.xOptions as string);
        if (options.useRecommendations)
            xOptions.push('+recommendations');
        if (xOptions.length > 0)
            headers['X-Options'] = xOptions.join(' ');
        let params = options.geoLocation ? {
            lat: options.geoLocation.lat.toString(),
            lon: options.geoLocation.lon.toString(),
            dist: options.geoLocation.dist.toString()
        } : {};
        console.log('p', params, image.bytes);
        let res :any = await this.httpClient.request<any>({
            method: 'POST',
            url: this.imageMatchingUrl,
            data: image.bytes,
            params,
            headers,
            responseType: 'json'
        });
        console.log(res);
        const categoryPredictions = Object.entries(res.data.predicted_category || {}).map(([name, score]) => ({
            name: name,
            score: score as number
        })).sort((a, b) => b.score - a.score);
        let codes = res.data.barcodes || [];

        let responseData = this.settings.responseHook? this.settings.responseHook(res.data) : res.data;

        let results : Result[] =
            responseData.offerInfos.map((r: Result, i: number) => ({
                ...r,
                position: i
            }));

        const requestId = res.headers["x-matching-request"];
        const duration = res.data.durationSeconds;
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
            'X-Api-Key': this.settings.apiKey,
            'Accept-Language': 'de,*;q=0.5',
            'Accept': this.responseFormat
        };
        const url = this.settings.imageMatchingUrlBySku + encodeURIComponent(sku) + '/' + encodeURIComponent(mid);
        if (this.settings.xOptions)
            headers['X-Options'] = this.settings.xOptions as string;
        let r:any = await this.httpClient.get(url, {headers, responseType: 'json'})
        if (this.settings.responseHook) {
            r = this.settings.responseHook;
        }
        return r;
    }

    /**
     * Find significant sections in the image.
     * @param canvas Canvas, video or image to search with.
     * @param options See [[ImageSearchOptions]].
     * @returns A list of regions, see [[Region]].
     */
    async findRegions(canvas: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement, options: ImageSearchOptions): Promise<Region[]> {
        let [origW, origH] = getElementSize(canvas);
        let {w: scaledW, h: scaledH} = getThumbSizeArea(options.maxWidth, options.maxHeight, origW, origH);
        let resizedCroppedCanvas = toCanvas(canvas, {w: scaledW, h: scaledH});
        let blob = await canvasToJpgBlob(resizedCroppedCanvas, options.jpegQuality);

        const headers = {
            'Content-Type': 'image/jpeg',
            'X-Api-Key': this.settings.apiKey
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
                x1: r.region.left / scaledW,
                x2: (r.region.right / scaledW),
                y1: r.region.top / scaledH,
                y2: (r.region.bottom / scaledH),
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
            'X-Api-Key': this.settings.apiKey,
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



