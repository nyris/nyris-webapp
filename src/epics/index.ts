// feedback api
import {combineEpics, Epic, ofType} from "redux-observable";
import {AppAction, AppState} from "../types";
import {ignoreElements, tap, withLatestFrom} from "rxjs/operators";

const feedbackSuccessEpic: Epic<AppAction, AppAction, AppState> = (action$, state$, {api}) => action$.pipe(
    ofType('FEEDBACK_SUBMIT_POSITIVE', "FEEDBACK_SUBMIT_NEGATIVE"),
    withLatestFrom(state$),
    tap(async ([{type}, state]) => {
        const success = type === 'FEEDBACK_SUBMIT_POSITIVE';
        await api.sendFeedback(state.search.sessionId, state.search.requestId, {
            event: 'feedback', data: {success}
        });
    }),
    ignoreElements()
);

const feedbackRegionEpic: Epic<AppAction, AppAction, AppState> = (action$, state$, {api}) => action$.pipe(
    ofType('REGION_CHANGED'),
    withLatestFrom(state$),
    tap(async ([action, state]) => {
        if (action.type === 'REGION_CHANGED') {
            let {region: {x1, x2, y1, y2}} = action;
            await api.sendFeedback(state.search.sessionId, state.search.requestId, {
                event: 'region', data: {rect: {x: x1, y: y1, w: x2 - x1, h: y2 - y1}}
            });
        }
    }),
    ignoreElements()
);

const feedbackClickEpic: Epic<AppAction, AppAction, AppState> = (action$, state$, {api}) => action$.pipe(
    ofType('RESULT_LINK_CLICKED', 'RESULT_IMAGE_CLICKED'),
    withLatestFrom(state$),
    tap(async ([action, state]) => {
        if (action.type === 'RESULT_LINK_CLICKED' || action.type === 'RESULT_IMAGE_CLICKED') {
            let {position} = action;
            await api.sendFeedback(state.search.sessionId, state.search.requestId, {
                event: 'click', data: {positions: [position]}
            });
        }
    }),
    ignoreElements()
);


const rootEpic = combineEpics(
    feedbackSuccessEpic,
    feedbackRegionEpic,
    feedbackClickEpic
);

export default rootEpic;
