import React from 'react';
import { ReactComponent as IconLike } from 'common/assets/icons/icon_like.svg';
import { ReactComponent as IconDislike } from 'common/assets/icons/icon_dislike.svg';
import { ReactComponent as IconClose } from 'common/assets/icons/close.svg';

function Feedback({
  submitFeedback,
  onFeedbackClose,
}: {
  submitFeedback: any;
  onFeedbackClose: any;
}) {
  return (
    <div className="feedback-wrapper">
      <p>Are these results useful?</p>
      <div
        className="feedback-icon-wrapper"
        onClick={() => submitFeedback(false)}
      >
        <IconDislike />
      </div>
      <div
        className="feedback-icon-wrapper"
        onClick={() => submitFeedback(true)}
      >
        <IconLike />
      </div>

      <div className="feedback-icon-wrapper" onClick={() => onFeedbackClose()}>
        <IconClose />
      </div>
    </div>
  );
}

export default Feedback;
