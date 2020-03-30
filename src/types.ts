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

    resultLinkText?: string,
    resultLinkIcon?: string,
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
