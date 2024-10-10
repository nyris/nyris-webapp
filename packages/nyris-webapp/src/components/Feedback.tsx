import React, { useState } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`feedback-wrapper`}
      style={{
        backgroundColor: isHovered ? '#D3D1FF' : '#e4e3ffed',
        transition: 'background-color 0.3s ease',
      }}
    >
      <p className="desktop:w-[146px]">Are these results useful?</p>
      <div
        className="feedback-icon-wrapper"
        onClick={() => submitFeedback(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <IconDislike />
      </div>
      <div
        className="feedback-icon-wrapper scroll-n"
        onClick={() => submitFeedback(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <IconLike />
      </div>
      <div
        className="feedback-icon-wrapper-close"
        onClick={() => onFeedbackClose()}
      >
        <IconClose />
      </div>
    </div>
  );
}

export default Feedback;
