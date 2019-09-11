import {AppAction} from "../types";


export type NyrisAppPart = 'start' | 'camera' | 'results';
export type NyrisFeedbackState = 'hidden' | 'question' | 'positive' | 'negative';


export interface NyrisAppState {
    showPart: NyrisAppPart,
    feedbackState: NyrisFeedbackState
}

export type NyrisAction =
    | { type: 'SHOW_START' }
    | { type: 'SHOW_CAMERA' }
    | { type: 'SHOW_RESULTS' }
    | { type: 'SHOW_FEEDBACK' }
    | { type: 'HIDE_FEEDBACK' }


const initialNyrisState : NyrisAppState = {
    showPart: 'start',
    feedbackState: 'hidden'
};

export function reducer(state : NyrisAppState = initialNyrisState, action: AppAction) : NyrisAppState {
    switch (action.type) {
        case 'SHOW_START':
            return {
                ...state,
                showPart: 'start'
            };
        case 'SHOW_CAMERA':
            return {
                ...state,
                showPart: 'camera'
            };
        case 'SHOW_RESULTS':
            return {
                ...state,
                showPart: 'results'
            };
        case 'SHOW_FEEDBACK':
            return {
                ...state,
                feedbackState: 'question'
            };
        case 'HIDE_FEEDBACK':
            return {
                ...state,
                feedbackState: 'hidden'
            };
        case 'FEEDBACK_SUBMIT_POSITIVE':
            return {
                ...state,
                feedbackState: 'positive'
            };
        case 'FEEDBACK_SUBMIT_NEGATIVE':
            return {
                ...state,
                feedbackState: 'negative'
            };
        default:
            return state;
    }
}
