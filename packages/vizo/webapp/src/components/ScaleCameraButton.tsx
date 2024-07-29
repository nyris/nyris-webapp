import React from "react";
import classNames from "classnames";

function ScaleCameraButton({
  scale,
  scaleCamera,
  setScaleCamera,
}: {
  scale: number;
  scaleCamera: number;
  setScaleCamera: any;
}) {
  return (
    <button
      className={classNames([
        "w-7",
        "h-7",
        "bg-transparent",
        "rounded-full",
        "border-none",
        "text-sm",
        "font-medium",
      ])}
      style={{
        backgroundColor: scaleCamera === scale ? "white" : "",
        color: scaleCamera === scale ? "black" : "white",
      }}
      onClick={() => setScaleCamera(scale)}
    >
      {scale}
    </button>
  );
}

export default ScaleCameraButton;
