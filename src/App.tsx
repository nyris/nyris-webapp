import './App.css';
import React from 'react';
import Result from './components/Result';
import Preview from './components/Preview';
import ExampleImages from './components/ExampleImages';
import Feedback from './components/Feedback';
import CategoryFilter from "./components/CategoryFilter";
import PredictedCategories from "./components/PredictedCategories";
import { useDropzone } from "react-dropzone";
import classNames from 'classnames';
import {Animate, NodeGroup} from "react-move";
import {Region, RegionResult} from "./types";

const stateEnum = {
    Search: 'search',
    Results: 'results',
    LoadingWithPreview: 'loadingWithPreview'
};

const state = 'ba';


let feedbackState = 0;


const makeFileHandler = (action: any) => (e: any) => {
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
        errorMessage?: string,
        regions: RegionResult[],
        selectedRegion: Region
    },
    previewImage?: HTMLCanvasElement,
    settings: any,
    handlers: any,
    loading: boolean
}

const App : React.FC<AppProps> = ({search: {results, regions, selectedRegion, requestId, duration, errorMessage, filterOptions, categoryPredictions }, settings, handlers, loading, previewImage}) => {
        const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop: handlers.onFileDropped});
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
                    <div   {...getRootProps({onClick: e => {e.stopPropagation();console.log('drop box click')}})} className={classNames('wrapper', 'dragAndDropActionArea', {'fileIsHover': isDragActive})}>
                        <div className="contentWrap">
                            <section className="uploadImage">
                                <input type="button" name="file" id="capture" className="inputfile" accept="image/*"
                                       capture="environment"/>
                                <input type="file" name="file" id="capture_file" className="inputfile" accept="image/*"
                                       capture="environment"/>
                                <input {...getInputProps()} type="file" name="file" id="select_file" className="inputfile" accept="image/*"
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
                            <ExampleImages images={settings.exampleImages} onExampleImageClicked={ (e: React.MouseEvent) => handlers.onExampleImageClicked(e.target) }/>
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

                <section className={classNames('results', (results.length === 1 ? 'singleProduct' : 'multipleProducts'))}
                         style={{
                             height: (state !== stateEnum.Search ? "auto" : "0"),
                             minHeight: state !== stateEnum.Search ? "90vh" : "0"
                         }}>
                    <div className="errorMsg">
                        {errorMessage}
                        <div style={{textAlign: 'center', fontSize: '0.7em', paddingTop: '0.8em'}}><span>Make sure to include the request ID when reporting a problem: {requestId}</span>
                        </div>
                    </div>
                    <Animate show={loading} start={{opacity: 0.0}} enter={{ opacity:  [1.0], timing: {duration: 300}}} leave={{opacity: [0.0], timing: {duration: 300}}}>
                        { s =>
                            <div className="loadingOverlay" style={{...s}}>
                                <div className="loading"/>
                            </div>
                        }
                    </Animate>
                    { previewImage &&
                        <Preview regions={regions} displaySelection={selectedRegion}  image={previewImage} />
                    }
                    <div className="predicted-categories">
                        <PredictedCategories cs={categoryPredictions}/>
                    </div>
                    <CategoryFilter cats={filterOptions}/>

                    {duration && (<div style={{textAlign: 'center', fontSize: '0.7em', paddingTop: '0.8em'}}>Search
                        took {duration.toFixed(2)} seconds</div>)}

                    {requestId && <div style={{textAlign: 'center', fontSize: '0.7em', paddingTop: '0.8em'}}>Request
                        identifier {requestId}</div>}
                    <div className="wrapper">
                        <NodeGroup data={results}
                                   keyAccessor={r => r.sku}
                                   start={(r, i) => ({opacity: 0, translateX: -100})}
                                   enter={(r, i) => ({opacity: [1], translateX: [0], timing: {delay: i*100, duration: 300}})}
                            >
                            {rs => <>{rs.map(({key, data, state}) => <Result key={key} result={data} style={{opacity: state.opacity, transform: `translateX(${state.translateX}%)`}}  />)}</>}
                        </NodeGroup>

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

    };



export default App;
