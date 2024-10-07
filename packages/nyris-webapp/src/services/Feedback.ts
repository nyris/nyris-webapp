import NyrisAPI, {
  FeedbackEventPayload,
  NyrisAPISettings,
  RectCoords,
} from '@nyris/nyris-api';
import { RootState } from '../Store/Store';

export const feedbackSuccessEpic = async (
  state: RootState,
  success: boolean,
) => {
  const { search, settings } = state;
  const requestId = search.requestId;

  return await sendFeedbackByApi(settings, undefined, requestId, {
    event: 'feedback',
    data: { success },
  });
};

export const feedbackClickEpic = async (
  state: RootState,
  position: number,
  id?: string,
) => {
  const { search, settings } = state;
  return await sendFeedbackByApi(settings, search.sessionId, search.requestId, {
    event: 'click',
    data: { positions: [position], ...(id ? { product_ids: [id] } : {}) },
  });
};

export const feedbackConversionEpic = async (
  state: RootState,
  position: number,
  id?: string,
) => {
  const { search, settings } = state;
  return await sendFeedbackByApi(settings, search.sessionId, search.requestId, {
    event: 'conversion',
    data: { positions: [position], ...(id ? { product_ids: [id] } : {}) },
  });
};

export const feedbackRegionEpic = async (
  state: RootState,
  region: RectCoords,
) => {
  const { settings, search } = state;
  const { sessionId, requestId } = search;
  const { x1, x2, y1, y2 } = region;
  const payload: FeedbackEventPayload = {
    event: 'region',
    data: { rect: { x: x1, y: y1, w: x2 - x1, h: y2 - y1 } },
  };
  return await sendFeedbackByApi(settings, sessionId, requestId, payload);
};

export const sendFeedbackByApi = async (
  settings: NyrisAPISettings,
  sessionId: string | undefined,
  requestId: string | undefined,
  payload: FeedbackEventPayload,
) => {
  const api = new NyrisAPI(settings);
  if (requestId) {
    try {
      await api.sendFeedback({ sessionId, requestId, payload }).then(res => {});
    } catch (error) {
      console.log('error sendFeedbackByApi', error);
    }
  }
};
