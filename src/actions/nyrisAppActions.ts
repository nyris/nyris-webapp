

export type NyrisAppPart = 'start' | 'camera' | 'results';


export interface NyrisAppState {
    showPart: NyrisAppPart
}

export type NyrisAction =
    | { type: 'SHOW_START' }
    | { type: 'SHOW_CAMERA' }
    | { type: 'SHOW_RESULTS' };


const initialNyrisState : NyrisAppState = {
    showPart: 'start'
};

export function reducer(state : NyrisAppState = initialNyrisState, action: NyrisAction) : NyrisAppState {
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
        default:
            return state;
    }
}
