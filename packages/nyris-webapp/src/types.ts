import {SearchAction, SearchState} from "./actions/searchActions";
import {NyrisAction, NyrisAppState} from "./actions/nyrisAppActions";
import {NyrisAPISettings} from "@nyris/nyris-api";

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

export type AppState = {
    search: SearchState,
    settings: AppSettings,
    nyrisDesign: NyrisAppState
};

export type AppAction =
    | SearchAction
    | NyrisAction

export interface CanvasWithId {
    canvas: HTMLCanvasElement
    id: string
}

