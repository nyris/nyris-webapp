
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
