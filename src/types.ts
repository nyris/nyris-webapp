import {SearchAction, SearchState} from "./actions/searchActions";
import {NyrisAction, NyrisAppState} from "./actions/nyrisAppActions";

export interface MDSettings {
    customFontFamily?: string,

    appBarLogoUrl: string,
    appBarTitle: string,
    appBarCustomBackgroundColor?: string,
    appBarCustomTextColor?: string,

    primaryColor: string,
    secondaryColor: string,
    resultFirstRowProperty: string,
    resultSecondRowProperty: string,

    resultImageProperty?: string,
    resultLinkProperty?: string,
    resultLinkText?: string,
}

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
    materialDesign?: MDSettings
}

export interface ImageSearchOptions {
    geoLocation?: { lat: number, lon: number, dist: number };
    crop?: { x: number, y: number, w: number, h: number };
    maxWidth: number;
    maxHeight: number;
    useRecommendations: boolean;
    jpegQuality: number;
}

export interface RectCoords {
    x1: number,
    y1: number,
    x2: number,
    y2: number
}

export type Region = {
    className?: string,
    confidence?: number
} & RectCoords

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

export type AppState = {
    search: SearchState,
    settings: SearchServiceSettings,
    nyrisDesign: NyrisAppState
};

export type AppAction =
    | SearchAction
    | NyrisAction


export interface Result {
    position: number,
    sku?: string,
    title?: string,
    l?: string,
    img?: { url?: string },
    // There can be also any other ddata
    [x: string]: any
}
