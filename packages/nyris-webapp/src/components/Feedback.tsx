import React from 'react';
import {NyrisFeedbackState} from "../actions/nyrisAppActions";
import {Animate} from "react-move";

interface FeedbackProps {
    feedbackState: NyrisFeedbackState,
    onPositiveFeedback?: () => void,
    onNegativeFeedback?: () => void,
    onClose?: () => void
}

const Feedback: React.FC<FeedbackProps> = ({feedbackState, onPositiveFeedback, onNegativeFeedback, onClose}) => {
    let inner : any = null;
    switch (feedbackState) {
        case 'question':
            inner =
                <div className="feedbackForm">
                    <p>Did you find what you were looking for?</p>
                    <div className="btn primary positiveFeedback" onClick={onPositiveFeedback}>Yes</div>
                    <div className="btn secondary negativeFeedback" onClick={onNegativeFeedback}>No</div>
                </div>;
            break;
        case 'positive':
            inner = <div className="feedbackMessage positive">Great, thank you for your feedback!</div>
            break;
        case 'negative':
            inner =
                <div className="feedbackMessage negative">We saved your request so we can track down the
                    issue and improve the search experience. Your Feedback helps us to make our service
                    better for everyone,
                    thank you!<br/>
                    <div className="btn dismiss" onClick={onClose}>Dismiss</div>
                </div>;
            break;
        default:
            inner = null;
            break;
    }
    return (
        <Animate show={feedbackState !== 'hidden'} start={{y: 100, opacity: 0}} enter={{y: [0], opacity: [1]}} leave={{y: [100], opacity: [0] }}>
            {({y, opacity}) =>
                <section className="feedback" style={{transform: `translateY(${y}%)`, opacity }}>
                    <div className="wrapper">
                        {inner}
                    </div>
                    <div className="closeFeedbackContainer">
                        <div className="closeFeedback" onClick={onClose}/>
                    </div>
                </section>
            }
        </Animate>
    );
};

export default Feedback;
