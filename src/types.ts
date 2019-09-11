export interface SearchServiceSettings {
    xOptions: boolean | string;
    customSearchRequest?: ((file: Blob, client: any) => Promise<any>);
    responseHook?: ((response: any) => any);
    apiKey: string;
    imageMatchingUrl?: string;
    imageMatchingUrlBySku?: string;
    imageMatchingSubmitManualUrl?: string;
    regionProposalUrl?: string;
    responseFormat?: string;
    feedbackUrl?: string;
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
