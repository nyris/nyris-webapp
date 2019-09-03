import React from 'react';

const Feedback = ({feedbackState, onPositiveFeedback, onNegativeFeedback}: {feedbackState: any, onPositiveFeedback: any, onNegativeFeedback: any}) => {
    let inner = null;
    switch (feedbackState) {
        case 0:
            inner =
                <div className="feedbackForm">
                    <p>Did you find what you were looking for?</p>
                    <div className="btn primary positiveFeedback" onClick={onPositiveFeedback}>Yes</div>
                    <div className="btn secondary negativeFeedback" onClick={onNegativeFeedback}>No</div>
                </div>;
            break;
        case 1:
            inner = <div className="feedbackMessage positive">Great, thank you for your feedback!</div>
            break;
        case 2:
            inner =
                <div className="feedbackMessage negative">We saved your request so we can track down the
                    issue and impove the search experience. Your Feedback helps us to make our service
                    better for everyone,
                    thank you!<br/>
                    <div className="btn dismiss">Dismiss</div>
                </div>;
            break;

    }
    return (
        <section className="feedback">
            <div className="wrapper">
                {inner}
            </div>
            <div className="closeFeedbackContainer">
                <div className="closeFeedback"/>
            </div>
        </section>
    );
};

export default Feedback;
