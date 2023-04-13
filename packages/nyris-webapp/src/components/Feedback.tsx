import { useAppDispatch, useAppSelector } from 'Store/Store';
import { feedbackNegative, feedbackSubmitPositive } from 'Store/nyris/Nyris';
import { NyrisFeedbackState } from 'Store/nyris/types';
import React from 'react';
import { Animate } from 'react-move';
import { feedbackSuccessEpic } from 'services/Feedback';
interface FeedbackProps {
  feedbackState: NyrisFeedbackState;
  onClose?: () => void;
}

const Feedback: React.FC<FeedbackProps> = ({ feedbackState, onClose }) => {
  let inner: any = null;
  const state = useAppSelector(state => state);
  const dispatch = useAppDispatch();
  const onPositiveFeedback = (data: boolean) => {
    feedbackSuccessEpic(state, data);
    if (data) {
      dispatch(feedbackSubmitPositive());
    } else {
      dispatch(feedbackNegative());
    }
  };

  switch (feedbackState) {
    case 'question':
      inner = (
        <div className="feedbackForm">
          <p>Did you find what you were looking for?</p>
          <div
            className="btn primary positiveFeedback"
            onClick={() => onPositiveFeedback(true)}
          >
            Yes
          </div>
          <div
            className="btn secondary negativeFeedback"
            onClick={() => onPositiveFeedback(false)}
          >
            No
          </div>
        </div>
      );
      break;
    case 'positive':
      inner = (
        <div className="feedbackMessage positive">
          Great, thank you for your feedback!
        </div>
      );
      break;
    case 'negative':
      inner = (
        <div className="feedbackMessage negative">
          We saved your request so we can track down the issue and improve the
          search experience. Your Feedback helps us to make our service better
          for everyone, thank you!
          <br />
          <div className="btn dismiss" onClick={onClose}>
            Dismiss
          </div>
        </div>
      );
      break;
    default:
      inner = null;
      break;
  }
  return (
    <Animate
      show={feedbackState !== 'hidden'}
      start={{ y: 100, opacity: 0 }}
      enter={{ y: [0], opacity: [1] }}
      leave={{ y: [100], opacity: [0] }}
    >
      {({ y, opacity }) => (
        <section
          className="feedback"
          style={{ transform: `translateY(${y}%)`, opacity }}
        >
          <div className="wrapper">{inner}</div>
          <div className="closeFeedbackContainer">
            <div className="closeFeedback" onClick={onClose} />
          </div>
        </section>
      )}
    </Animate>
  );
};

export default Feedback;
