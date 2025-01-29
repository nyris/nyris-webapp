import React, { useRef } from 'react';
import Webcam from 'react-webcam';
import { Icon } from '@nyris/nyris-react-components';
import { ReactComponent as CloseButton } from '../images/close.svg';
import '../styles/web-camera-modal.scss';

interface IWebCameraModal {
  handlerFindImage: (f: any) => void;
  onClose: () => void;
}

export const WebCameraModal = (props: IWebCameraModal) => {
  const webcamRef = useRef<Webcam>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc && inputRef && inputRef.current) {
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "webcam-image.jpg", {
            type: 'image/jpeg',
          });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          if (inputRef.current) {
            inputRef.current.files = dataTransfer.files;
            const changeEvent = new Event("change", { bubbles: true });
            inputRef.current.dispatchEvent(changeEvent);
          }
        });
    }
  };

  return (
    <div className="web-camera-modal">
      <div className="web-camera-modal-header">
        <CloseButton
          className="web-camera-modal-header-close"
          width={16}
          color="#fff"
          onClick={() => props.onClose()}
        />
      </div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width="100%"
        className="web-camera-modal-video"
      />
      <div className="web-camera-modal-actions">
        <input
          type="file"
          name="file"
          ref={inputRef}
          id="camera-upload"
          className="absolute z-[-1] opacity-0"
          placeholder="Choose photo"
          accept={
            '.stp,.step,.stl,.obj,.glb,.gltf,.heic,.heif,image/*'
          }
          onChange={(file: any) => {
            props.handlerFindImage(file);
          }}
          onClick={event => {
            // @ts-ignore
            event.target.value = '';
          }}
        />
        <label htmlFor="camera-upload" className="web-camera-modal-actions-gallery">
          <Icon name="gallery" />
        </label>
        <button
          onClick={capture}
          className="web-camera-modal-actions-photo"
        >
          <svg
            width="63"
            height="63"
            viewBox="0 0 63 63"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="31.5" cy="31.5" r="31.5" fill="white" />
          </svg>
        </button>
      </div>
    </div>
  )
};
