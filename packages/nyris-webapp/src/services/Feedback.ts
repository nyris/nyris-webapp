import NyrisAPI, {
  FeedbackEventPayload,
  NyrisAPISettings,
  RectCoords,
} from '@nyris/nyris-api';
import { RootState } from '../Store/Store';
import { ToastHelper } from '../helpers/ToastHelper';
import { toast } from 'react-hot-toast';

export const feedbackSuccessEpic = async (
  state: RootState,
  success: boolean,
) => {
  const { search, settings } = state;
  const sessionId = search.sessionId;
  const requestId = search.requestId || search.sessionId;

  try {
    const res = await sendFeedbackByApi(settings, sessionId, requestId, {
      event: 'feedback',
      data: { success },
    });
    toast.dismiss();
    ToastHelper.success('Thank you for your feedback.');
    return res;
  } catch (err: any) {
    console.log(err);
  }
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
  if (sessionId && requestId) {
    try {
      await api.sendFeedback(sessionId, requestId, payload).then(res => {});
    } catch (error) {
      console.log('error sendFeedbackByApi', error);
    }
  }
};
