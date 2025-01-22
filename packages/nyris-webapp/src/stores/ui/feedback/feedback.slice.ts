import { StateCreator } from 'zustand';
import { FeedbackAction, FeedbackState } from 'stores/types';

import { initialState } from './feedback.initialState';

const feedbackSlice: StateCreator<FeedbackState & FeedbackAction> = set => ({
  ...initialState,
  setShowFeedback: (showFeedback: boolean) => set(state => ({ showFeedback })),
});

export default feedbackSlice;
