import './App.css';
import React from 'react';
import Result from './components/Result';
import Preview from './components/Preview';
import ExampleImages from './components/ExampleImages';
import Feedback from './components/Feedback';
import CategoryFilter from "./components/CategoryFilter";
import PredictedCategories from "./components/PredictedCategories";
import Codes from "./components/Codes";
import {Code, CategoryPrediction} from "./NyrisAPI";
import {useDropzone} from "react-dropzone";
import classNames from 'classnames';
import {Animate, NodeGroup} from "react-move";
import {AppSettings, MDSettings, RectCoords, Region} from "./types";
import {NyrisAppPart, NyrisFeedbackState} from "./actions/nyrisAppActions";
import Capture from "./components/Capture";


const makeFileHandler = (action: any) => (e: any) => {
    let file = (e.dataTransfer && e.dataTransfer.files[0]) || e.target.files[0];
    if (e.target && e.target.value) {
        e.target.value = "";
    }

    if (file) {
        action(file);
    }
};

export interface AppHanders {
    onExampleImageClick: (url: string) => void,
    onImageClick: (position: number, url: string) => void,
    onLinkClick: (position: number, url: string) => void,
    onFileDropped: (file: File) => void,
    onCaptureComplete: (image: HTMLCanvasElement) => void,
    onCaptureCanceled: () => void,
    onSelectFile: (f: File) => void,
    onCameraClick: () => void,
    onShowStart: () => void,
    onSelectionChange: (r: RectCoords) => void,
    onPositiveFeedback: () => void,
    onNegativeFeedback: () => void,
    onCloseFeedback: () => void,
}

export interface AppProps {
    search: {
        results: any[],
        requestId?: string,
        duration?: number,
        categoryPredictions: CategoryPrediction[],
        codes: Code[],
        filterOptions: string[],
        errorMessage?: string,
        regions: Region[],
        initialRect: RectCoords
    },
    previewImage?: HTMLCanvasElement,
    settings: AppSettings,
    loading: boolean,
    showPart: NyrisAppPart,
    feedbackState: NyrisFeedbackState,
    handlers: AppHanders,
    mdSettings: MDSettings
}

const App: React.FC<AppProps> = ({
                                     search: {results, regions, initialRect, requestId, duration, errorMessage, filterOptions, categoryPredictions, codes},
                                     showPart, settings, handlers, loading, previewImage, feedbackState
                                 }) => {
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop: (fs: File[]) => handlers.onFileDropped(fs[0])});

    const minPreviewHeight = 400;
    const halfOfTheScreenHeight = Math.floor(window.innerHeight * 0.45);
    const maxPreviewHeight = Math.max(minPreviewHeight, halfOfTheScreenHeight);

    return (
        <div>
            {showPart === 'camera' &&
            <Capture onCaptureComplete={handlers.onCaptureComplete} onCaptureCanceled={handlers.onCaptureCanceled}
                     onFileSelected={makeFileHandler(handlers.onSelectFile)} useAppText='Use default camera app'/>}
            <div className={classNames('headSection', {hidden: showPart === 'results'})} id="headSection">
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
                <div   {...getRootProps({
                    onClick: e => {
                        e.stopPropagation();
                    }
                })} className={classNames('wrapper', 'dragAndDropActionArea', {'fileIsHover': isDragActive})}>
                    <div className="contentWrap">
                        <section className="uploadImage">
                            <input type="button" name="file" id="capture" className="inputfile" accept="image/*"
                                   capture="environment" onClick={handlers.onCameraClick}/>
                            <input type="file" name="file" id="capture_file" className="inputfile" accept="image/*"
                                   capture="environment"/>
                            <input {...getInputProps()} type="file" name="file" id="select_file" className="inputfile"
                                   accept="image/*"
                                   onChange={makeFileHandler(handlers.onSelectFile)}
                            />
                            <div className="onDesktop">
                                Drop an image
                                <div className="smallText">or</div>
                            </div>
                            <div className="onMobile camIcon">
                                <img src="./images/ic_cam_large.svg" alt="Camera"/>
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
                        <ExampleImages images={settings.exampleImages} onExampleImageClicked={handlers.onExampleImageClick}/>
                    </div>
                </div>
                <div className={classNames('tryDifferent', {hidden: showPart !== 'results'})}
                     onClick={handlers.onShowStart}>
                    <div className="icIcon">
                    </div>
                    <div className="textDesc"> Try a different image</div>
                    <br style={{clear: 'both'}}/>
                </div>
                <div className="headerSeparatorTop"/>
                <div className="headerSeparatorBack"/>
            </div>

            <section
                className={classNames('results', {resultsActive: showPart === 'results'}, (results.length === 1 ? 'singleProduct' : 'multipleProducts'))}>
                {errorMessage &&
                <div className="errorMsg">
                    {errorMessage}
                    <div style={{textAlign: 'center', fontSize: '0.7em', paddingTop: '0.8em'}}><span>Make sure to include the request ID when reporting a problem: {requestId}</span>
                    </div>
                </div>
                }
                <Animate show={loading} start={{opacity: 0.0}} enter={{opacity: [1.0], timing: {duration: 300}}}
                         leave={{opacity: [0.0], timing: {duration: 300}}}>
                    {s =>
                        <div className="loadingOverlay" style={{...s}}>
                            <div className="loading"/>
                        </div>
                    }
                </Animate>
                {settings.preview && previewImage &&
                <div className="preview">
                    <Preview key={regions.length}
                             maxWidth={document.body.clientWidth} maxHeight={maxPreviewHeight}
                             dotColor="#4C8F9F"
                             onSelectionChange={handlers.onSelectionChange} regions={regions}
                             initialRect={initialRect} image={previewImage}/>
                </div>
                }
                <div className="predicted-categories">
                    <PredictedCategories cs={categoryPredictions}/>
                </div>
                <div className="predicted-categories">
                    <Codes codes={codes}/>
                </div>
                <CategoryFilter cats={filterOptions}/>

                <div className="wrapper">
                    <NodeGroup data={results}
                               keyAccessor={r => r.sku}
                               start={(r, i) => ({opacity: 0, translateX: -100})}
                               enter={(r, i) => ({
                                   opacity: [1],
                                   translateX: [0],
                                   timing: {delay: i * 100, duration: 300}
                               })}
                    >
                        {rs => <>{rs.map(({key, data, state}) => <Result
                            key={key}
                            noImageUrl={settings.noImageUrl}
                            template={settings.resultTemplate}
                            onImageClick={handlers.onImageClick}
                            onLinkClick={handlers.onLinkClick}
                            result={data}
                            style={{opacity: state.opacity, transform: `translateX(${state.translateX}%)`}}/>)}</>}
                    </NodeGroup>

                    {results.length === 0 && showPart === 'results' && !loading && (

                        <div className="noResults">We did not find anything <span role="img"
                                                                                  aria-label="sad face">😕</span></div>
                    )}

                    <br style={{clear: 'both'}}/>

                    {duration && showPart === 'results' && (<div style={{textAlign: 'center', fontSize: '0.7em', paddingTop: '0.8em'}}>Search
                        took {duration.toFixed(2)} seconds</div>)}

                    {requestId && showPart === 'results' && <div style={{textAlign: 'center', fontSize: '0.7em', paddingTop: '0.8em'}}>Request
                        identifier {requestId}</div>}
                </div>
            </section>

            <section className="footnote">
                <div className="wrapper">
                    © 2017 - 2019 <a href="https://nyris.io">nyris GmbH</a> - All rights reserved - <a
                    href="https://nyris.io/imprint/">Imprint</a>
                </div>
            </section>
            <Feedback feedbackState={feedbackState} onPositiveFeedback={handlers.onPositiveFeedback}
                      onNegativeFeedback={handlers.onNegativeFeedback} onClose={handlers.onCloseFeedback}/>
        </div>
    );

};



export default App;
