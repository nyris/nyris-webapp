import { createSlice } from "@reduxjs/toolkit";

export type NyrisAppPart = "start" | "camera" | "results";
export type NyrisFeedbackState =
  | "hidden"
  | "question"
  | "positive"
  | "negative";
export interface NyrisAppState {
  showPart: NyrisAppPart;
  feedbackState: NyrisFeedbackState;
}

const initialState: NyrisAppState | NyrisFeedbackState = {
  showPart: "start",
  feedbackState: "hidden",
};

export const nyrisSlice = createSlice({
  name: "nyris",
  initialState,
  reducers: {
    showStart: (state) => {
      return {
        ...state,
        showPart: "start",
      };
    },
    showCamera: (state) => {
      return {
        ...state,
        showPart: "camera",
      };
    },
    showResults: (state) => {
      return {
        ...state,
        showPart: "results",
      };
    },
    showFeedback: (state) => {
      return {
        ...state,
        feedbackState: "question",
      };
    },
    hideFeedback: (state) => {
      return {
        ...state,
        feedbackState: "hidden",
      };
    },
    feedbackSubmitPositive: (state) => {
      return {
        ...state,
        feedbackState: "positive",
      };
    },
    feedbackNegative: (state) => {
      return {
        ...state,
        feedbackState: "negative",
      };
    },
  },
});

export const {
  showStart,
  showCamera,
  showResults,
  showFeedback,
  hideFeedback,
  feedbackSubmitPositive,
  feedbackNegative,
} = nyrisSlice.actions;
export default nyrisSlice.reducer;
