import './App.css';
import React from 'react';
import Result from './components/Result';
import Preview from './components/Preview';
import ExampleImages from './components/ExampleImages';
import Feedback from './components/Feedback';
import CategoryFilter from "./components/CategoryFilter";
import PredictedCategories from "./components/PredictedCategories";

const stateEnum = {
    Search: 'search',
    Results: 'results',
    LoadingWithPreview: 'loadingWithPreview'
};
const previewDots: any[] = [];
const displaySelection = {};

const state = 'ba';


let feedbackState = 0;


const makeFileHandler = (action: any) => (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    let file = (e.dataTransfer && e.dataTransfer.files[0]) || e.target.files[0];
    action(file);
};








interface AppProps {
    search: {
        results: any[],
        requestId?: string,
        duration?: number,
        categoryPredictions: { name: string, score: number}[],
        filterOptions: string[],
        errorMessage?: string
    },
    settings: any,
    handlers: any,
    loading: boolean
}

class App extends React.Component<AppProps> {
    render() {
        const {search: {results, requestId, duration, errorMessage, filterOptions, categoryPredictions }, settings, handlers, loading} = this.props;
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
                                <input type="file" name="file" id="select_file" className="inputfile" accept="image/*"
                                       onChange={makeFileHandler(handlers.onSelectFile)}
                                />
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
                            <ExampleImages imgs={settings.exampleImages} onExampleImageClicked={handlers.onExampleImageClicked}/>
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
                        {errorMessage}
                        <div style={{textAlign: 'center', fontSize: '0.7em', paddingTop: '0.8em'}}><span>Make sure to include the request ID when reporting a problem: {requestId}</span>
                        </div>
                    </div>
                    { loading && (
                        <div className="loadingOverlay">
                            <div className="loading"/>
                        </div>
                    ) }
                    <Preview dots={previewDots} displaySelection={displaySelection}
                             visible={(settings.preview || settings.regions) && (state === stateEnum.Results || state === stateEnum.LoadingWithPreview)}/>
                    <div className="predicted-categories">
                        <PredictedCategories cs={categoryPredictions}/>
                    </div>
                    <CategoryFilter cats={filterOptions}/>

                    {duration && (<div style={{textAlign: 'center', fontSize: '0.7em', paddingTop: '0.8em'}}>Search
                        took {duration.toFixed(2)} seconds</div>)}

                    {requestId && <div style={{textAlign: 'center', fontSize: '0.7em', paddingTop: '0.8em'}}>Request
                        identifier {requestId}</div>}
                    <div className="wrapper">
                        {results.map((result) => <Result {...result} />)}

                        {results.length === 0 && (

                            <div className="noResults">We did not find anything <span role="img"
                                                                                      aria-label="sad face">😕</span></div>
                        )}
                        <br style={{clear: 'both'}}/>
                    </div>
                </section>

                <section className="footnote">
                    <div className="wrapper">
                        © 2017 - 2019 <a href="https://nyris.io">nyris GmbH</a> - All rights reserved - <a href="https://nyris.io/imprint/">Imprint</a>
                    </div>
                </section>
                <Feedback feedbackState={feedbackState} onPositiveFeedback={handlers.onPositiveFeedback} onNegativeFeedback={handlers.onNegativeFeedback}/>
            </div>
        );

    }
}



export default App;
