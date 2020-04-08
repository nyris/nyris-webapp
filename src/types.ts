import {SearchAction, SearchState} from "./actions/searchActions";
import {NyrisAction, NyrisAppState} from "./actions/nyrisAppActions";
import {NyrisAPISettings} from "./NyrisAPI";

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

export interface AppSettings extends NyrisAPISettings {
    exampleImages: string[],
    preview: boolean,
    noImageUrl?: string,
    resultTemplate?: string,
    regions: boolean,
    materialDesign?: MDSettings,
    instantRedirectPatterns: string[]
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

export interface CanvasWithId {
    canvas: HTMLCanvasElement
    id: string
}

export interface WH {
    w: number,
    h: number
}

export type AppState = {
    search: SearchState,
    settings: AppSettings,
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
