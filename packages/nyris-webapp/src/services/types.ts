// import {SearchAction, SearchState} from "./actions/searchActions";
// import {NyrisAction, NyrisAppState} from "./actions/nyrisAppActions";


import {MDSettings} from "../types";

export interface SearchServiceSettings {
    xOptions: boolean | string,
    customSearchRequest?: ((file: Blob, client: any) => Promise<any>),
    responseHook?: ((response: any) => any),
    apiKey: string,
    imageMatchingUrl?: string,
    imageMatchingUrlBySku?: string,
    imageMatchingSubmitManualUrl?: string,
    regionProposalUrl?: string,
    responseFormat?: string,
    feedbackUrl?: string,
    exampleImages: string[],
    resultTemplate?: string,
    noImageUrl?: string,
    materialDesign?: MDSettings,
    preview: boolean,
    regions: boolean,
    jpegQuality: number,
    maxWidth: number,
    maxHeight: number,
    useRecommendations: boolean
}

export interface Crop {
    x: number,
    y: number,
    w: number,
    h: number
}

export interface WH {
    w: number,
    h: number
}

export interface Result {
    position: number,
    sku?: string,
    title?: string,
    l?: string,
    img?: { url?: string },
    // There can be also any other data
    [x: string]: any
}
