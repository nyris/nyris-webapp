export type NyrisAppPart = 'start' | 'camera' | 'results';
export type NyrisFeedbackState = 'hidden' | 'question' | 'positive' | 'negative';
export type NyrisAction =
    | { type: 'SHOW_START' }
    | { type: 'SHOW_CAMERA' }
    | { type: 'SHOW_RESULTS' }
    | { type: 'SHOW_FEEDBACK' }
    | { type: 'HIDE_FEEDBACK' }
    | { type: 'RESULT_LINK_CLICKED', position: number, url: string}
    | { type: 'RESULT_IMAGE_CLICKED', position: number, url: string}