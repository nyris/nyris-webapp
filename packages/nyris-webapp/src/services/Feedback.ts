import NyrisAPI, {FeedbackEventPayload, NyrisAPISettings, RectCoords} from "@nyris/nyris-api";
import {RootState} from "../Store/Store";

export const feedbackSuccessEpic = async (state: RootState, success: boolean) => {
  const { search, settings } = state;
  return await sendFeedbackByApi(settings, search.sessionId, search.requestId, {
    event: 'feedback',
    data: { success }
  });
};

export const feedbackClickEpic = async (state: RootState, position: number) => {
  const { search, settings } = state;
  return await sendFeedbackByApi(settings, search.sessionId, search.requestId, {
    event: "click",
    data: { positions: [position] },
  });
};

export const feedbackTextSearchEpic = async (state: RootState, query: string, page: number, productIds: string[]) => {
  try {
    const { search, settings } = state;
    const eventData = {
      query,
      page,
      product_ids: productIds,
    };
    const textSearchEvent = { event: "text-search", data: eventData };
    // @ts-ignore
    return await sendFeedbackByApi(settings, search.sessionId, search.requestId, textSearchEvent);
  } catch (error) {
    console.log("error feedbackTextSearchEpic", error);
  }
};

export const feedbackRegionEpic = async (state: RootState, region: RectCoords) => {
  const {settings, search} = state;
  const {sessionId, requestId } = search;
  const { x1, x2, y1, y2 } = region;
  const payload : FeedbackEventPayload = {
        event: "region",
        data: { rect: { x: x1, y: y1, w: x2 - x1, h: y2 - y1 } }
  };
  return await sendFeedbackByApi(settings, sessionId, requestId, payload);
};

export const sendFeedbackByApi = async (
  settings: NyrisAPISettings,
  sessionId: string | undefined,
  requestId: string | undefined,
  payload: FeedbackEventPayload
) => {
  const api = new NyrisAPI(settings);
  if (sessionId && requestId) {
    try {
      const dataByApi = await api
        .sendFeedback(sessionId, requestId, payload)
        .then((res) => {});
      console.log("dataByApi", dataByApi);
    } catch (error) {
      console.log("error sendFeedbackByApi321", error);
    }
  }
};
