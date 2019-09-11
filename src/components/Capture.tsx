import React, {ChangeEvent} from 'react';
import './Capture.component.css';
import {toCanvas} from "../nyris";

export interface CaptureProps {
    onCaptureComplete: (image: HTMLCanvasElement) => void,
    onCaptureCanceled: () => void,
    onFileSelected: (f: ChangeEvent<HTMLInputElement>) => void,
    useAppText: string
}


class Capture extends React.Component<CaptureProps> {
    private video = React.createRef<HTMLVideoElement>();
    private track?: MediaStreamTrack ;

    private grabFrame(): void {
        if (this.video.current) {
            let frame = toCanvas(this.video.current);
            this.props.onCaptureComplete(frame);
        }
    }

    componentDidMount(): void {
        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment', // prefers wrong entry on old android: facingMode: ['environment', 'user'],
                width: 640//this.settings.maxWidth,// unsupported on ios {ideal: settings.maxWidth},
                //height: this.settings.maxHeight
            }
        }).then(stream => {
            let vid = this.video.current;
            if (vid !== null) {
                vid.srcObject = stream;
                this.track = stream.getVideoTracks()[0];
            }
        }).catch(reason => {
            switch (reason.name) {
                case 'NotFoundError':
                    alert('Camera not found. Try with a file instead.');
                    break;
                case 'NotAllowedError':
                    alert('You have to allow using the camera in order to take pictures. If you are not asked again for permissions, go to site settings and reset permissions there.');
                    break;
                default:
                    alert(`Sorry, something has gone wrong while enabeling the camera. (${reason})`);
                    break;
            }
        });


    }


    render() {
        let {onCaptureCanceled, onCaptureComplete, onFileSelected, useAppText} = this.props;

        return (
            <div id="capture-ui">
                <video autoPlay playsInline ref={this.video}/>
                <input type="file" name="file" id="capture_file" className="inputfile" accept="image/*"
                       capture="environment" onChange={onFileSelected}/>
                <label className="app-button" htmlFor="capture_file">{useAppText}</label>
                <button className="backBtn" onClick={onCaptureCanceled}><img src="images/capture/arrow_back.svg"
                                                                             alt="back"
                                                                             width="72"/></button>
                <button className="searchBtn" onClick={() => this.grabFrame()}><img src="images/capture/capture.svg"
                                                                               alt="capture"/>
                </button>
            </div>
        );
    }
}


export default Capture;
