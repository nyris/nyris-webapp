import {ImageSearchOptions, Region, RegionData, RegionResult, SearchServiceSettings} from "./types";
import {canvasToJpgBlob, getElementSize, getThumbSizeArea, toCanvas} from "./nyris";
import axios, {AxiosInstance} from 'axios';

interface SearchResult {
    results: any[],
    requestId: string,
    categoryPredictions: { name: string, score: number}[],
    duration: number
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
    product_ids: string[]
}

interface FeedbackEventBase {
    request_id: string,
    timestamp: Date,
    session_id: string
}

interface SuccessEvent extends FeedbackEventBase {
    event: 'feedback',
    data: FeedbackData
}

interface RegionEvent extends FeedbackEventBase {
    event: 'region',
    data: RegionData
}
interface ClickEvent extends FeedbackEventBase {
    event: 'click',
    data: ClickData
}

type FeedbackEvent =
    | SuccessEvent
    | RegionEvent
    | ClickEvent


export default class NyrisAPI {
    private readonly httpClient: AxiosInstance;
    private readonly imageMatchingUrl: string;
    private readonly regionProposalUrl: string;
    private readonly responseFormat: string;
    private imageMatchingUrlBySku: string;
    private imageMatchingSubmitManualUrl: string;

    constructor(private settings: SearchServiceSettings) {
        this.httpClient = axios.create();
        this.imageMatchingUrl = this.settings.imageMatchingUrl || 'https://api.nyris.io/find/v1';
        this.imageMatchingUrlBySku = this.settings.imageMatchingUrlBySku || 'https://api.nyris.io/recommend/v1/';
        this.imageMatchingSubmitManualUrl = this.settings.imageMatchingSubmitManualUrl || 'https://api.nyris.io/find/v1/manual/';
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
        const categoryPredictions = Object.entries(res.predicted_category || {}).map(([name, score]) => ({
            name: name,
            score: score as number
        })).sort((a, b) => b.score - a.score);

        let results = this.settings.responseHook? (await this.settings.responseHook(res)) : res.data.offerInfos;
        const requestId = res.headers["X-Matching-Request"];
        const duration = res.data.durationSeconds;
        return { results, requestId, duration, categoryPredictions };
    }

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
            r = await this.settings.responseHook;
        }
        return r;
    }

    async findRegions(canvas: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement, options: ImageSearchOptions): Promise<RegionResult[]> {
        let [origW, origH] = getElementSize(canvas);
        let {w: scaledW, h: scaledH} = getThumbSizeArea(options.maxWidth, options.maxHeight, origW, origH);
        let resizedCroppedCanvas = toCanvas(canvas, {w: scaledW, h: scaledH});
        let blob = await canvasToJpgBlob(resizedCroppedCanvas, options.jpegQuality);

        const headers = {
            'Content-Type': 'image/jpeg',
            'X-Api-Key': this.settings.apiKey
        };
        let response = await
            this.httpClient.request<RegionResult[]>({
                method: 'POST',
                url: this.regionProposalUrl,
                data: blob,
                headers
            });
        let regions :RegionResult[] = response.data;
        return regions.map(r => ({
                className: r.className,
                confidence: r.confidence,
                region: {
                    left: r.region.left / scaledW,
                    right: r.region.right / scaledW,
                    x2: r.region.right / scaledW,
                    top: r.region.top / scaledH,
                    bottom: r.region.bottom / scaledH,
                    y2: r.region.bottom / scaledH
                }
            }));
    }

    async sendNegativeFeedback(requestId: string) {
        const headers = {
            'X-Api-Key': this.settings.apiKey
        };
        const url = this.settings.imageMatchingSubmitManualUrl as string;
        return await this.httpClient.post(url, null, {headers});
    }

    async sendFeedback(requestId: string, data: FeedbackEvent) {

    }
}



