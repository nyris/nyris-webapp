import React, { useState } from "react";
import { ReactComponent as IconLike } from "../images/icon_like.svg";
import { ReactComponent as IconDislike } from "../images/icon_dislike.svg";
import { ReactComponent as IconClose } from "../images/close.svg";

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
      className={`nyris__feedback-wrapper`}
      style={{
        backgroundColor: isHovered ? "#D3D1FF" : "#e4e3ffed",
        transition: "background-color 0.3s ease",
      }}
    >
      <p className="">Are these results useful?</p>
      <div
        className="nyris__feedback-icon-wrapper"
        onClick={() => submitFeedback(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <IconDislike />
      </div>
      <div
        className="nyris__feedback-icon-wrapper"
        onClick={() => submitFeedback(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <IconLike />
      </div>
      <div
        className="nyris__feedback-icon-wrapper nyris__feedback-icon-wrapper-close"
        onClick={() => onFeedbackClose()}
      >
        <IconClose />
      </div>
    </div>
  );
}

export default Feedback;
