import {combineEpics, ofType} from "redux-observable";
import {debounceTime, ignoreElements, tap, withLatestFrom} from "rxjs/operators";
import {EpicConf} from "./types";

const feedbackSuccessEpic: EpicConf = (action$, state$, {api}) => action$.pipe(
    ofType('FEEDBACK_SUBMIT_POSITIVE', "FEEDBACK_SUBMIT_NEGATIVE"),
    withLatestFrom(state$),
    tap(async ([{type}, state]) => {
        const success = type === 'FEEDBACK_SUBMIT_POSITIVE';
        const sessionId = state.search.sessionId || state.search.requestId;
        if (sessionId && state.search.requestId) {
            await api.sendFeedback(sessionId, state.search.requestId, {
                event: 'feedback', data: {success}
            });
        }
    }),
    ignoreElements()
);

const feedbackRegionEpic: EpicConf = (action$, state$, {api}) => action$.pipe(
    ofType('REGION_CHANGED'),
    debounceTime(600),
    withLatestFrom(state$),
    tap(async ([action, state]) => {
        if (action.type === 'REGION_CHANGED') {
            let {normalizedRect: {x1, x2, y1, y2}} = action;
            const sessionId = state.search.sessionId || state.search.requestId;
            if (sessionId && state.search.requestId) {
                await api.sendFeedback(sessionId, state.search.requestId, {
                    event: 'region', data: {rect: {x: x1, y: y1, w: x2 - x1, h: y2 - y1}}
                });
            }
        }
    }),
    ignoreElements()
);

const feedbackClickEpic: EpicConf = (action$, state$, {api}) => action$.pipe(
    ofType('RESULT_LINK_CLICKED', 'RESULT_IMAGE_CLICKED'),
    withLatestFrom(state$),
    tap(async ([action, state]) => {
        if (action.type === 'RESULT_LINK_CLICKED' || action.type === 'RESULT_IMAGE_CLICKED') {
            let {position} = action;
            const sessionId = state.search.sessionId || state.search.requestId;
            if (sessionId && state.search.requestId) {
                await api.sendFeedback(sessionId, state.search.requestId, {
                    event: 'click', data: {positions: [position]}
                });
            }
        }
    }),
    ignoreElements()
);

export default combineEpics(
    feedbackSuccessEpic,
    feedbackRegionEpic,
    feedbackClickEpic
);
