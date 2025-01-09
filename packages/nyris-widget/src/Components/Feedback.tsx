import React, { useState } from 'react';
import { Icon } from '@nyris/nyris-react-components';
import translations from '../translations';

function Feedback({
  submitFeedback,
  onFeedbackClose,
  labels,
}: {
  submitFeedback: any;
  onFeedbackClose: any;
  labels: any;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`nyris__feedback-wrapper`}
      style={{
        backgroundColor: isHovered ? '#D3D1FF' : '#e4e3ffed',
        transition: 'background-color 0.3s ease',
      }}
    >
      <p className="">{labels['Are these results useful?']}</p>
      <div
        className="nyris__feedback-icon-wrapper"
        onClick={() => submitFeedback(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Icon name="dislike" />
      </div>
      <div
        className="nyris__feedback-icon-wrapper"
        onClick={() => submitFeedback(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Icon name="like" />
      </div>
      <div
        className="nyris__feedback-icon-wrapper nyris__feedback-icon-wrapper-close"
        onClick={() => onFeedbackClose()}
      >
        <Icon name="close" />
      </div>
    </div>
  );
}

export default Feedback;
