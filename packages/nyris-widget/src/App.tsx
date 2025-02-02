import React, { useCallback, useState } from "react";

import eye from "./eye.svg";
import close from "./images/close.svg";
import drop_zone from "./images/dropzone.svg";
import camera from "./images/camera.svg";
import spinner from "./images/spinner.svg";
import crop from "./images/crop.svg";
import collapse from "./images/collapse.svg";
import trash from "./images/trash.svg";
import { debounce } from "lodash";

import { ReactComponent as Logo } from "./images/logo.svg";
import { ReactComponent as DeutscheLogo } from "./images/deutsche_logo.svg";

import "./styles/nyris.scss";

import { Result } from "./Result";
import { RectCoords, Region } from "@nyris/nyris-api";
import { Preview } from "@nyris/nyris-react-components";
import classNames from "classnames";
import { useDropzone } from "react-dropzone";
import translations from "./translations";

const labeles = translations(window.nyrisSettings.language);

export enum Screen {
  Hidden = "hidden",
  Hello = "hello",
  Wait = "wait",
  Fail = "fail",
  Result = "results",
  Refine = "refine",
}

export interface AppProps {
  image: HTMLCanvasElement;
  errorMessage: string;
  showScreen: Screen;
  thumbnailUrl: string;
  results: any[];
  regions: Region[];
  selection: RectCoords;
  showVisualSearchIcon: boolean;
  onClose: () => void;
  onRestart: () => void;
  onRefine: () => void;
  onToggle: () => void;
  onFile: (f: any) => void;
  onFileDropped: (f: File) => void;
  onAcceptCrop: (r: RectCoords) => void;
  onSimilarSearch: (url: string) => void;
  loading: boolean;
}

const SuccessMultiple = ({
  onAcceptCrop,
  results,
  onSimilarSearch,
  image,
  regions,
  selection,
  onRestart,
  onFile,
  loading,
}: AppProps) => {
  const noResult = results.length === 0;

  const [currentSelection, setCurrentSelection] = useState(selection);
  const [expand, setExpand] = useState(noResult ? true : false);

  const debouncedOnImageSelectionChange = useCallback(
    debounce((r: RectCoords) => {
      onAcceptCrop(r);
    }, 500),
    []
  );

  return (
    <>
      <div className="nyris__screen nyris__success-multiple">
        <div className="nyris__main-heading ">
          {noResult ? labeles["Let’s try that again"] : labeles["Success!"]}
        </div>
        <div className="nyris__main-description">
          {noResult
            ? labeles["We couldn’t find matches"]
            : `${results.length} ${labeles["matches found"]}`}
        </div>
        <div className="nyris__main-content">
          <div className="nyris__success-multiple-preview">
            <div className="nyris__success-multiple-preview-wrapper">
              <Preview
                image={image}
                selection={currentSelection}
                onSelectionChange={(r: any) => {
                  setCurrentSelection(r);
                  debouncedOnImageSelectionChange(r);
                }}
                regions={regions}
                minWidth={100 * (image.width / image.height)}
                minHeight={100}
                dotColor={expand ? "#FBD914" : ""}
                minCropWidth={expand ? 60 : 10}
                minCropHeight={expand ? 60 : 10}
                rounded={false}
                expandAnimation={expand}
                shrinkAnimation={!expand}
                onExpand={() => {
                  setExpand(true);
                }}
                showGrip={expand}
                resize={true}
                style={{ width: "75%" }}
                draggable={expand ? true : false}
              />
            </div>
            <div
              className={`nyris__success-multiple-preview-delete-${
                expand ? "expand" : "collapse"
              }`}
              onClick={onRestart}
            >
              {<img src={trash} width={16} height={16} />}
            </div>
            <input
              type="file"
              name="take-picture"
              id="nyris__hello-open-camera"
              accept="image/jpeg,image/png,image/webp"
              onChange={onFile}
              style={{ display: "none" }}
            />
            <div
              className={`nyris__success-multiple-preview-${
                expand ? "expand" : "collapse"
              }`}
              onClick={() => {
                setExpand((s) => !s);
              }}
            >
              {!expand && <img src={crop} width={16} height={16} />}
              {expand && <img src={collapse} width={16} height={16} />}
            </div>
          </div>

          {loading && <LoadingSpinner />}
          {!loading && (
            <div className="nyris__success-multiple-result-list">
              {results.map((r, i) => (
                <Result {...r} key={i} onSimilarSearch={onSimilarSearch} />
              ))}
            </div>
          )}
        </div>

        <label
          htmlFor="nyris__hello-open-camera"
          className={`nyris__success-multiple-camera`}
          style={{
            bottom: noResult ? "60px" : "",
            backgroundColor: window.nyrisSettings.cameraIconColour,
          }}
        >
          {<img src={camera} width={24} height={24} />}
        </label>
      </div>
    </>
  );
};

const LoadingSpinner = () => {
  return (
    <div className="nyris__main-content nyris__wait-wrapper">
      <div className="nyris__wait-spinner">
        <img src={spinner} width={66} height={66} />
      </div>
      <div>{labeles["Analyzing image..."]}</div>
    </div>
  );
};

const Wait = () => (
  <div className="nyris__screen nyris__wait">
    <div className="nyris__main-heading">{labeles["Hold on"]}</div>
    <div className="nyris__main-description">
      {labeles["We are working hard on finding the product"]}
    </div>
    <LoadingSpinner />
  </div>
);

const Fail = ({
  errorMessage,
  onRestart,
  onAcceptCrop,
  image,
  regions,
  selection,
  onFile,
}: AppProps) => {
  const [currentSelection, setCurrentSelection] = useState(selection);
  const isMobile = document.body.clientWidth < 512;

  const acceptCrop = () => onAcceptCrop(currentSelection);
  // @ts-ignore
  const showPreview = image && image.type !== "error";

  return (
    <div className="nyris__screen nyris__fail">
      <div className="nyris__main-heading">{errorMessage}</div>
      <div className="nyris__main-description">
        <p>
          <br />
          <br />
          {labeles["Oops!"]}
        </p>
      </div>
      <div className="nyris__fail-content">
        <label
          className="nyris__button-accept"
          htmlFor="nyris__hello-open-camera"
        >
          <span>
            {isMobile
              ? labeles["Click a picture"]
              : labeles["Upload a picture"]}
          </span>
          <img src={camera} width={16} height={16} />
        </label>
        <input
          type="file"
          name="take-picture"
          id="nyris__hello-open-camera"
          accept="image/jpeg,image/png"
          onChange={onFile}
          capture="environment"
          style={{
            display: "none",
          }}
        />
      </div>
    </div>
  );
};

const Hello = ({ onFile, onFileDropped }: AppProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (fs: File[]) => onFileDropped(fs[0]),
  });

  const logo =
    window.nyrisSettings.language === "en" ? (
      <Logo fill={window.nyrisSettings.primaryColor} width={318} height={134} />
    ) : (
      <DeutscheLogo
        fill={window.nyrisSettings.primaryColor}
        width={329}
        height={134}
      />
    );

  return (
    <div className="nyris__screen nyris__hello">
      <div className="nyris__logo">
        {window.nyrisSettings.customerLogo ? (
          <img
            src={window.nyrisSettings.customerLogo}
            width={window.nyrisSettings.logoWidth || 318}
          />
        ) : (
          logo
        )}
      </div>
      <div className="nyris__hello-wrapper">
        <div className="nyris__main-content nyris__main-content--mobile">
          <label
            className="nyris__hello-browse"
            htmlFor="nyris__hello-upload-input"
            style={{
              color: window.nyrisSettings.primaryColor,
              backgroundColor: window.nyrisSettings.browseGalleryButtonColor,
            }}
          >
            {labeles["Browse gallery"]}
          </label>
          <label
            className="nyris__hello-upload"
            style={{ backgroundColor: window.nyrisSettings.primaryColor }}
            htmlFor="nyris__hello-open-camera"
          >
            {labeles["Take a photo"]}
            <img src={camera} width={16} height={16} />
          </label>
        </div>

        <div className="nyris__main-content nyris__main-content--desktop">
          <label
            className="nyris__hello-upload"
            style={{ backgroundColor: window.nyrisSettings.primaryColor }}
            htmlFor="nyris__hello-upload-input"
          >
            {labeles["Upload a picture"]}
            <img src={camera} width={16} height={16} />
          </label>

          <div
            className={`nyris__hello-drop-zone ${
              isDragActive ? "active-drop" : ""
            }`}
            {...getRootProps()}
          >
            <img src={drop_zone} width={48} height={48} />
            <div>
              <span className="nyris__hello-drop-zone-bold-text">
                {labeles["Drag and drop an image here"]}
              </span>
            </div>
          </div>
        </div>

        <input
          type="file"
          name="upload"
          id="nyris__hello-upload-input"
          onChange={onFile}
          accept="image/jpeg,image/png,image/webp"
        />
        <input
          type="file"
          name="take-picture"
          id="nyris__hello-open-camera"
          accept="image/jpeg,image/png"
          onChange={onFile}
          capture="environment"
        />
      </div>
    </div>
  );
};

export const App = (props: AppProps) => {
  const {
    showScreen,
    onClose,
    onToggle,
    results,
    onFile,
    showVisualSearchIcon,
    errorMessage,
    onRestart,
  } = props;

  let content = null;
  let wide = false;
  let resultsSingle = false;
  let resultsMultiple = false;

  switch (showScreen) {
    case Screen.Hello:
      content = <Hello {...props} />;
      break;
    case Screen.Wait:
      content = <Wait />;
      break;
    case Screen.Fail:
      content = (
        <Fail {...props} errorMessage={labeles["Something went wrong"]} />
      );
      break;
    case Screen.Result:
      content = <SuccessMultiple {...props} />;
      wide = true;
      resultsMultiple = true;
      break;
  }

  const divMainClassNames = classNames({
    nyris__main: true,
    "nyris__main--wide": wide,
    nyrisMultipleProducts: resultsMultiple,
    nyrisSingleProduct: resultsSingle,
  });
  const showPoweredByNyris = !process.env.IS_ENTERPRISE;
  return (
    <React.Fragment>
      {showScreen != Screen.Hidden && (
        <>
          <div className="nyris__background" onClick={onClose} />
          <div className="nyris__wrapper">
            <div className={divMainClassNames}>
              <div className="nyris__header">
                <div className="nyris__header-icon" onClick={onClose}>
                  <img src={close} width={16} height={16} />
                </div>
              </div>
              {content}
              <div
                className="nyris__footer"
                style={{
                  paddingBottom:
                    showScreen == Screen.Result && results?.length > 0
                      ? showPoweredByNyris
                        ? "80px"
                        : "50px"
                      : "",
                }}
              >
                {showPoweredByNyris && (
                  <a target="_blank" href="https://nyris.io/">
                    Powered by{" "}
                    <span className="nyris__footer-logo">nyris®</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      {showVisualSearchIcon && (
        <div className="nyris__icon" onClick={onToggle} onDrop={onFile}>
          <img src={eye} width={38} height={22} />
          <div className="nyris__icon-text">Try our visual search</div>
        </div>
      )}
    </React.Fragment>
  );
};

export default App;
