export type NyrisAppPart = 'start' | 'camera' | 'results';
export type NyrisFeedbackState =
  | 'hidden'
  | 'question'
  | 'positive'
  | 'negative';

export interface NyrisAppState {
  showPart: NyrisAppPart;
  feedbackState: NyrisFeedbackState;
}
