import React from 'react';
import { useDropzone } from 'react-dropzone';
import drop_zone from "./assets/dropzone.svg";

interface IAppProps {
  search: any;
}

function App(props: IAppProps) {
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
        <img src={drop_zone} width={48} height={48} />
        <div className="drag-n-drop-text">
          <strong>Drag and drop</strong> an image here
        </div>
      </div>
      <div className="help-buttons">
        <button>
          Are you looking for a specific brand?
        </button>
        <button>
          Do you have a category in mind?
        </button>
      </div>
    </>
  )
}

export default App;
