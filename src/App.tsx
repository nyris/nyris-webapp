import React from 'react';
import './App.css';
import Result from './Result';
import Preview from './Preview';
import {connect} from "react-redux";

const stateEnum = {
    Search: 'search',
    Results: 'results',
    LoadingWithPreview: 'loadingWithPreview'
};
const previewDots: any[] = [];
const displaySelection = {};

const state = 'ba';
const duration = 0.1234;

const filterOptions = ["a"];
const showCategoryFilter = (cats: any[]) => {
    if (cats.length === 0) {
        return null;
    }
    return (
        <div id="catlist" style={{'textAlign': 'center'}}>
            {
                cats.map((s) => <a href="#">{s}</a>) // TODO fix link
            }
        </div>
    );
};


const renderFeedback = ({onPositiveFeedback, onNegativeFeedback}) => {
    let inner = null;
    switch (feedbackState) {
        case 0:
            inner =
                    <div className="feedbackForm">
                        <p>Did you find what you were looking for?</p>
                        <div className="btn primary positiveFeedback" onClick={onPositiveFeedback}>Yes</div>
                        <div className="btn secondary negativeFeedback" onClick={onNegativeFeedback}>No</div>
                    </div>
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
                </div>
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


let feedbackState = 0;

const renderExampleImgs = (imgs: any[]) => {
    if (imgs.length === 0) {
        return null;
    }
    return (
        <section className="useExampleImg">
            You can also try one of these pictures:
            <div className="exampleImages">
                <div className="exImagesWrap">
                    {imgs.map((i) => (<img key={i} src={i} alt="" crossOrigin="anonymous"/>))}
                </div>
            </div>
        </section>
    );
};

const showPredictedCategories = (cs: any[]) => cs.map((c) =>
    <small>
        {c.name === "" ? "No category" : c.name.split(" > ").slice(-1)[0]}:
        {(c.score * 100).toFixed(0)}%
    </small>
);


const predicted_category = [
    {
        name: 'aaaaa',
        score: 0.1324
    }
];

const requestId = "resuest id";
const errorMsg = "Some error message";

const App = ({results, settings}: { results: any[], settings: any }) => {
    return (
        <div>
            <div className="headSection" id="headSection">
                <div className="navWrap">
                    <div className="wrapper">
                        <section id="branding"/>
                        <div id="menu" className="menuWrap" role="navigation">
                            <ul>
                                <li><a href="https://nyris.io/imprint/#privacy" target="_blank"
                                       rel="noopener noreferrer">Privacy Policy</a></li>
                                <li><a href="https://nyris.io/" target="_blank" rel="noopener noreferrer">Visit our
                                    Website</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="wrapper dragAndDropActionArea fileIsHover">
                    <div className="contentWrap">
                        <section className="uploadImage">
                            <input type="button" name="file" id="capture" className="inputfile" accept="image/*"
                                   capture="environment"/>
                            <input type="file" name="file" id="capture_file" className="inputfile" accept="image/*"
                                   capture="environment"/>
                            <input type="file" name="file" id="select_file" className="inputfile" accept="image/*"/>
                            <div className="onDesktop">
                                Drop an image
                                <div className="smallText">or</div>
                            </div>
                            <div className="onMobile camIcon">
                                <img src="images/ic_cam_large.svg" alt="Camera"/>
                            </div>
                            <label htmlFor="capture" className="btn primary onMobile"
                                   style={{marginBottom: '2em', width: '22em'}}>
                                <span className="onMobile">Take a picture</span>
                            </label>
                            <br/>
                            <label htmlFor="select_file" className="btn primary" style={{width: '22em'}}>
                                <span>Select a file</span>
                            </label>
                            <label htmlFor="capture" className="mobileUploadHandler onMobile"/>
                        </section>

                        {renderExampleImgs(settings.exampleImages)}
                    </div>
                </div>
                <div className="tryDifferent">
                    <div className="icIcon">
                    </div>
                    <div className="textDesc"> Try a different image</div>
                    <br style={{clear: 'both'}}/>
                </div>
                <div className="headerSeparatorTop"/>
                <div className="headerSeparatorBack"/>
            </div>

            <section className={['result', (results.length === 1 ? 'singleProduct' : 'multipleProducts')].join(' ')}
                     style={{
                         height: (state !== stateEnum.Search ? "auto" : "0"),
                         minHeight: state !== stateEnum.Search ? "90vh" : "0"
                     }}>
                <div className="errorMsg">
                    {errorMsg}
                    <div style={{textAlign: 'center', fontSize: '0.7em', paddingTop: '0.8em'}}><span>Make sure to include the request ID when reporting a problem: {requestId}</span>
                    </div>
                </div>
                <div className="loadingOverlay">
                    <div className="loading"/>
                </div>
                <Preview dots={previewDots} displaySelection={displaySelection}
                         visible={(settings.preview || settings.regions) && (state === stateEnum.Results || state === stateEnum.LoadingWithPreview)}/>
                <div className="predicted-categories">
                    {showPredictedCategories(predicted_category)}
                </div>
                {showCategoryFilter(filterOptions)}

                {duration ? (<div style={{textAlign: 'center', fontSize: '0.7em', paddingTop: '0.8em'}}>Search
                    took {duration.toFixed(2)} seconds</div>) : null}

                {requestId ? <div style={{textAlign: 'center', fontSize: '0.7em', paddingTop: '0.8em'}}>Request
                    identifier {requestId}</div> : null}
                <div className="wrapper">
                    {results.map((result) => <Result {...result} />)}

                    {results.length === 0 ? (

                        <div className="noResults">We did not find anything <span role="img"
                                                                                  aria-label="sad face">😕</span></div>
                    ) : null}
                    <br style={{clear: 'both'}}/>
                </div>
            </section>

            <section className="footnote">
                <div className="wrapper">
                    © 2017 - 2019 nyris GmbH - All rights reserved - <a href="https://nyris.io/imprint/">Imprint</a>
                </div>
            </section>
            { renderFeedback({onPositiveFeedback, onNegativeFeedback}) }
        </div>
    );
};

const mapStateToProps = (state: any) => ({
    view: state.nyrisDesign.view,
    results: state.search.results,
    settings: state.settings
});

const mapDispatchToProps = ()

export default connect(mapStateToProps, mapDispatchToProps)(App);
