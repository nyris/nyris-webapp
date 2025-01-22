import NyrisAPI, {
  FeedbackEventPayload,
  NyrisAPISettings,
  RectCoords,
} from '@nyris/nyris-api';

export const feedbackSuccessEpic = async (
  requestId: string,
  success: boolean,
) => {
  const settings = window.settings;

  return await sendFeedbackByApi(settings, undefined, requestId, {
    event: 'feedback',
    data: { success },
  });
};

export const feedbackClickEpic = async (
  requestId: string,
  sessionId: string,
  position: number,
  id?: string,
) => {
  const settings = window.settings;
  return await sendFeedbackByApi(settings, sessionId, requestId, {
    event: 'click',
    data: { positions: [position], ...(id ? { product_ids: [id] } : {}) },
  });
};

export const feedbackConversionEpic = async (
  requestId: string,
  sessionId: string,
  position: number,
  id?: string,
) => {
  const settings = window.settings;
  return await sendFeedbackByApi(settings, sessionId, requestId, {
    event: 'conversion',
    data: { positions: [position], ...(id ? { product_ids: [id] } : {}) },
  });
};

export const feedbackRegionEpic = async (
  requestId: string,
  sessionId: string,
  region: RectCoords,
) => {
  const settings = window.settings;
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
