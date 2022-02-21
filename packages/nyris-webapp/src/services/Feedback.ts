import NyrisAPI from "@nyris/nyris-api";

export const feedbackSuccessEpic = async (state: any, success: boolean) => {
  const { search, settings } = state;
  try {
    const api = new NyrisAPI(settings);
    const sessionId = search.sessionId || search.requestId;
    return await api.sendFeedback(sessionId, search.requestId, {
      event: "feedback",
      data: { success },
    });
  } catch (error) {
    console.log("error feedbackSuccessEpic", error);
  }
};

export const feedbackClickEpic = async (state: any, position: number) => {
  try {
    const { search, settings } = state;
    const api = new NyrisAPI(settings);
    const sessionId = search.sessionId || search.requestId;
    if (sessionId && state.search.requestId) {
      await api.sendFeedback(sessionId, state.search.requestId, {
        event: "click",
        data: { positions: [position] },
      });
    }
  } catch (error) {
    console.log("error feedbackClickEpic", feedbackClickEpic);
  }
};

export const feedbackRegionEpic = async (state: any, region: any) => {
  try {
    const { search, settings } = state;
    const api = new NyrisAPI(settings);
    const sessionId = search.sessionId || search.requestId;
    const { x1, x2, y1, y2 } = region;
    if (sessionId && search.requestId) {
      await api.sendFeedback(sessionId, search.requestId, {
        event: "region",
        data: { rect: { x: x1, y: y1, w: x2 - x1, h: y2 - y1 } },
      });
    }
  } catch (error) {
    console.log("error feedbackRegionEpic", error);
  }
};
