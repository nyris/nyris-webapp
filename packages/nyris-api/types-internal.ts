import {Code, OfferNyrisResult} from "./types-external";

interface NyrisRegion {
    left: number,
    top: number,
    right: number,
    bottom: number
}

export interface NyrisRegionResult {
    className: string,
    region: NyrisRegion,
    confidence: number
}

export type CategoryPredictionResponse = { [category:string]:number };

export interface SearchResponseBase {
    id: string
    session: string
    predicted_category?: CategoryPredictionResponse
    barcodes?: Code[]
}
export interface OfferCompleteResponse extends SearchResponseBase {
    results: OfferCompleteResult[]
}

/**
 * Response of `application/offers.nyris+json`
 */
export interface OfferNyrisResponse extends SearchResponseBase {
    durationSeconds: number
    offerInfos: OfferNyrisResult[]
}


/**
 * application/offers.complete+json
 */
export interface OfferCompleteResult {
    title: string
    description?: string
    price?: string
    links?: {
        main?: string
    }
    images: string[]
    sku: string
    score: number
}

