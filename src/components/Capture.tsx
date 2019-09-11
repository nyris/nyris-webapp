import React from 'react';
import 'Capture.component.css';

export interface CaptureProps {
    onCaptureComplete: (image: HTMLCanvasElement) => void,
    onCaptureCanceled: () => void,
    onFileSelected: (f: File) => void,
    useAppText: string
}

function grabFrame() {

}

function handleFileSelected() {

}

const Capture: React.FC<CaptureProps> = ({onCaptureCanceled, onCaptureComplete, onFileSelected, useAppText}) => {
    return (
        <div id="capture-ui">
            <video autoPlay playsinline/>
            <input type="file" name="file" id="capture_file" className="inputfile" accept="image/*"
                   capture="environment" onChange={handleFileSelected}/>
            <label className="app-button" htmlFor="capture_file">{useAppText}</label>
            <button className="backBtn" onClick={onCaptureCanceled}><img src="images/capture/arrow_back.svg" alt="back"
                                                                         width="72"/></button>
            <button className="searchBtn" onClick={grabFrame}><img src="images/capture/capture.svg" alt="capture"/>
            </button>
        </div>
    );
};

export default Capture;
