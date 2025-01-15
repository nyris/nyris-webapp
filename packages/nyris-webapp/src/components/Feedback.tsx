import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '@nyris/nyris-react-components';

import '../styles/feedback.scss';

function Feedback({
  submitFeedback,
  onFeedbackClose,
}: {
  submitFeedback: any;
  onFeedbackClose: any;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const { t } = useTranslation();

  return (
    <div
      className={`feedback-wrapper`}
      style={{
        backgroundColor: isHovered ? '#D3D1FF' : '#e4e3ffed',
        transition: 'background-color 0.3s ease',
      }}
    >
      <p className="desktop:w-[146px]">{t('Are these results useful?')}</p>
      <div
        className="feedback-icon-wrapper"
        onClick={() => submitFeedback(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Icon name="dislike" />
      </div>
      <div
        className="feedback-icon-wrapper"
        onClick={() => submitFeedback(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Icon name="like" />
      </div>
      <div
        className="feedback-icon-wrapper-close"
        onClick={() => onFeedbackClose()}
      >
        <Icon name="close" />
      </div>
    </div>
  );
}

export default Feedback;
