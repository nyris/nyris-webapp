import {ImageSearchOptions, RegionData, RegionResult, SearchServiceSettings} from "./types";
import {canvasToJpgBlob, getElementSize, getThumbSizeArea, toCanvas} from "./nyris";
import axios, {AxiosInstance} from 'axios';

interface SearchResult {
    results: any[],
    requestId: string,
    duration: number
}

export default class NyrisAPI {
    private httpClient: AxiosInstance;
    private imageMatchingUrl: string;
    private regionProposalUrl: string;

    constructor(private settings: SearchServiceSettings) {
        this.httpClient = axios.create();
        this.imageMatchingUrl = this.settings.imageMatchingUrl || 'default'; // TODO propper defaults
        this.regionProposalUrl = this.settings.regionProposalUrl || 'default'; // TODO propper defaults
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

        let headers : any = { // HttpHeaders is immutable
            'Content-Type': 'image/jpeg',
            'X-Api-Key': this.settings.apiKey,
            'Accept-Language': 'de,*;q=0.5',
            'Accept': this.settings.responseFormat
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
        let res :any = this.httpClient.request<any>({
            method: 'POST',
            url: this.imageMatchingUrl,
            data: image.bytes,
            params,
            headers,
            responseType: 'json'
        });
        console.log(res);
        if (res.predicted_category) {
            res.predicted_category = Object.entries(res.predicted_category).map(([name, score]) => ({
                name: name,
                score: score as number
            })).sort((a, b) => b.score - a.score);
        }

        if (this.settings.responseHook) {
            res = await this.settings.responseHook(res);
        } else {
            res = res.data.offerInfos;
        }
        const requestId = res.headers["X-Matching-Request"];
        const duration = res.data.durationSeconds;
        return { results: res.data.offerInfos, requestId, duration };
    }

    async findBySku(sku: string, mid: string) {
        let headers: any = {
            'X-Api-Key': this.settings.apiKey,
            'Accept-Language': 'de,*;q=0.5',
            'Accept': this.settings.responseFormat
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
        let s = origW / scaledW;

        const headers = {
            'X-Api-Key': this.settings.apiKey
        };
        let response = await
            this.httpClient.post<RegionResult[]>(this.regionProposalUrl, blob, {headers})
        let regions :RegionResult[] = response.data;
        return regions.map(r => ({
                className: r.className,
                confidence: r.confidence,
                region: {
                    left: r.region.left * s,
                    right: r.region.right * s,
                    x2: r.region.right * s,
                    top: r.region.top * s,
                    bottom: r.region.bottom * s,
                    y2: r.region.bottom * s
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
}



