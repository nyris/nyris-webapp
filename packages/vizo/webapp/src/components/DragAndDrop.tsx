import React, { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { ReactComponent as UploadIcon } from "../assets/dropzone.svg";

interface IAppProps {
  search: (fs: File) => void;
  searchBar: React.ReactNode;
  setSearchImage: any;
  setImageThumb: any;
}

function DragAndDrop(props: IAppProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (fs: File[]) => props.search(fs[0]),
  });

  useEffect(() => {
    const { setSearchImage, setImageThumb } = props;

    setImageThumb(null);
    setSearchImage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* {props.searchBar} */}
      <div
        className={`drag-n-drop ${isDragActive ? "active-drop" : ""}`}
        {...getRootProps()}
      >
        <UploadIcon className="w-12 h-12 text-[#55566B]" />
        <input {...getInputProps()} />
        <div className="drag-n-drop-text">
          <strong>Drag and drop</strong> an image here
        </div>
      </div>
      <div className="help-buttons"></div>
    </>
  );
}

export default DragAndDrop;
