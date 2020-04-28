import React, {ChangeEvent, useEffect, useRef, useState} from 'react';
import './Capture.css';
import {urlOrBlobToCanvas, elementToCanvas} from "@nyris/nyris-api";
import captureSvg from './images/capture.svg';
import arrowBackSvg from './images/arrow_back.svg';

export interface CaptureProps {
    onCaptureComplete: (image: HTMLCanvasElement) => void
    onCaptureCanceled: () => void
    useAppText: string
}


const Capture = ({onCaptureComplete, onCaptureCanceled, useAppText} : CaptureProps) => {
    const video = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream>();

    const grabFrame = () => {
        if (video.current) {
            let frame = elementToCanvas(video.current);
            onCaptureComplete(frame);
        }
    };

    const onFileSelected = async (e: ChangeEvent) => {
        let fileInput = e.target as HTMLInputElement;
        if (fileInput && fileInput.files) {
            let file = await urlOrBlobToCanvas(fileInput.files[0]);
            onCaptureComplete(file);
        }
    };

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment', // prefers wrong entry on old android: facingMode: ['environment', 'user'],
                width: 640//this.settings.maxWidth,// unsupported on ios {ideal: settings.maxWidth},
                //height: this.settings.maxHeight
            }
        }).then(stream => {
            let vid = video.current;
            if (vid) {
                vid.srcObject = stream;
                setStream(stream);
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
    }, [video]);

    useEffect(() => () => {
        if (!stream) {
            return;
        }
        if (stream.getVideoTracks && stream.getAudioTracks) {
          stream.getVideoTracks().map(track => track.stop());
          stream.getAudioTracks().map(track => track.stop());
        } else {
          ((stream as unknown) as MediaStreamTrack).stop();
        }
    }, [stream]);

    return (
        <div className="nyris-capture-captureUi">
            <video autoPlay playsInline ref={video} className="nyris-capture-video"/>
            <input type="file" name="file" id="capture_file" className='nyris-capture-inputFile' accept="image/*"
                   capture="environment" onChange={onFileSelected}/>
            <label className="nyris-capture-app-button" htmlFor="capture_file">{useAppText}</label>
            <button className="nyris-capture-backBtn" onClick={onCaptureCanceled}><img src={arrowBackSvg}
                                                                         alt="back"
                                                                         width="72"/></button>
            <button className="nyris-capture-searchBtn" onClick={grabFrame}><img src={captureSvg}
                                                                           alt="capture"/>
            </button>
        </div>
    );
};


export default Capture;
