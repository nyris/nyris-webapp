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
};

export interface Rect {
    x: number,
    y: number,
    x2: number,
    y2: number
}



export interface Crop {
    x: number,
    y: number,
    w: number,
    h: number
}


export interface Region {
    left: number,
    top: number,
    right: number,
    bottom: number,
    x2: number,
    y2: number
}

export interface Dot {
    x: number,
    y: number,
    text: string
}

export interface RegionResult {
    className: string,
    region: Region,
    confidence: number
}

export interface RegionData {
    rect: {
        x: number,
        y: number,
        w: number,
        h: number
    }
};

export interface FeedbackData {
    success: boolean
};

export interface ClickData {
    positions: number[],
    product_ids: string[]
};

enum EventType {
    click = "click",
    feedback = "feedback",
    region = "region"
};

interface EventData {
    request_id: string,
    timestamp: Date,
    session_id: string,
    event: EventType,
    data: RegionData | FeedbackData | ClickData
};
