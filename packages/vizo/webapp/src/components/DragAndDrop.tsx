import React from 'react';
import { useDropzone } from 'react-dropzone';
import drop_zone from '../assets/dropzone.svg';

interface IAppProps {
  search: any;
}

function DragAndDrop(props: IAppProps) {
  console.log(props);
  const { getRootProps, isDragActive } = useDropzone({
    onDrop: (fs: File[]) => onFileDropped(fs[0]),
  });

  const onFileDropped = (file: any) => {
    console.log(file);
  }
  return (
    <>
      <div
        className={`drag-n-drop ${
          isDragActive ? "active-drop" : ""
        }`}
        {...getRootProps()}
      >
        <img src={drop_zone} width={48} height={48} alt="drag and drop zone" />
        <div className="drag-n-drop-text">
          <strong>Drag and drop</strong> an image here
        </div>
      </div>
      <div className="help-buttons">
      </div>
    </>
  )
}

export default DragAndDrop;
