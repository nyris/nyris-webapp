import "App.css";
import React, { useEffect, useState } from "react";
import Result from "components/Result";
import ExampleImages from "components/ExampleImages";
import CategoryFilter from "components/CategoryFilter";
import PredictedCategories from "components/PredictedCategories";
import Codes from "components/Codes";
import { useDropzone } from "react-dropzone";
import classNames from "classnames";
import { Animate, NodeGroup } from "react-move";
import {
  makeFileHandler,
  Capture, Preview,
} from "@nyris/nyris-react-components";
import { Snackbar } from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";

import {AppProps} from "./propsType";

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const LandingPageApp = (props: AppProps) => {
  const {
    handlers,
    showPart,
    acceptTypes,
    settings,
    search,
    loading,
    previewImage
  } = props;

  const {
    results,
    requestId,
    duration,
    categoryPredictions,
    codes,
    filterOptions,
    errorMessage,
    regions,
    previewSelection
  } = search;

  const {
    onExampleImageClick,
    onImageClick,
    onLinkClick,
    onFileDropped,
    onCaptureComplete,
    onCaptureCanceled,
    onSelectFile,
    onCameraClick,
    onShowStart,
    onSelectionChange,
  } = handlers;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (fs: File[]) => {
      onFileDropped(fs[0]);
    },
  });


  const [toastOpen, setToastOpen] = useState(false);
  useEffect(() => {
    if (errorMessage !== "") {
      setToastOpen(true);
    }
  }, [errorMessage]);

  const minPreviewHeight = 400;
  const halfOfTheScreenHeight = Math.floor(window.innerHeight * 0.45);
  const maxPreviewHeight = Math.max(minPreviewHeight, halfOfTheScreenHeight);

  return (
      <div>
        {showPart === "camera" && (
        <Capture
          onCaptureComplete={ onCaptureComplete }
          onCaptureCanceled={ onCaptureCanceled }
          useAppText="Use default camera app"
        />
      )}
      <div
        className={classNames("headSection", {
          hidden: showPart === "results",
        })}
        id="headSection"
      >
        <div
          {...getRootProps({
            onClick: (e) => {
              e.stopPropagation();
            },
          })}
          className={classNames("wrapper", "dragAndDropActionArea", {
            fileIsHover: isDragActive,
          })}
        >
          <div className="contentWrap">
            <section className="uploadImage">
              <input
                type="button"
                name="file"
                id="capture"
                className="inputfile"
                accept="image/*"
                capture="environment"
                onClick={() => onCameraClick()}
              />
              <input
                type="file"
                name="file"
                id="capture_file"
                className="inputfile"
                accept={acceptTypes}
                capture="environment"
              />
              <input
                {...getInputProps()}
                type="file"
                name="file"
                id="select_file"
                className="inputfile"
                accept={acceptTypes}
                onChange={makeFileHandler(onSelectFile)}
              />
              <div className="onDesktop">
                Drop an image
                <div className="smallText">or</div>
              </div>
              <div className="onMobile camIcon">
                <img src="./images/ic_cam_large.svg" alt="Camera" />
              </div>
              <label
                htmlFor="capture"
                className="btn primary onMobile"
                style={{ marginBottom: "2em", width: "22em" }}
              >
                <span className="onMobile">Take a picture</span>
              </label>
              <br />
              <label
                htmlFor="select_file"
                className="btn primary"
                style={{ width: "22em" }}
              >
                <span>Select a file</span>
              </label>
              <label
                htmlFor="capture"
                className="mobileUploadHandler onMobile"
              />
            </section>
            <ExampleImages
              images={settings.exampleImages}
              onExampleImageClicked={onExampleImageClick}
            />
          </div>
        </div>
        <div
          className={classNames("tryDifferent", {
            hidden: showPart !== "results",
          })}
          onClick={() => onShowStart()}
        >
          <div className="icIcon"></div>
          <div className="textDesc"> Try a different image</div>
          <br style={{ clear: "both" }} />
        </div>
        <div className="headerSeparatorTop" />
        <div className="headerSeparatorBack" />
      </div>

      <section
        className={classNames(
          "results",
          { resultsActive: showPart === "results" },
          results.length === 1 ? "singleProduct" : "multipleProducts"
        )}
      >
        {errorMessage && (
          <div className="errorMsg">
            {errorMessage}
            <div
              style={{
                textAlign: "center",
                fontSize: "0.7em",
                paddingTop: "0.8em",
              }}
            >
              <span>
                Make sure to include the request ID when reporting a problem:{" "}
                {requestId}
              </span>
            </div>
          </div>
        )}
        <Animate
          show={loading}
          start={{ opacity: 0.0 }}
          enter={{ opacity: [1.0], timing: { duration: 300 } }}
          leave={{ opacity: [0.0], timing: { duration: 300 } }}
        >
          {(s) => (
            <div className="loadingOverlay" style={{ ...s }}>
              <div className="loading" />
            </div>
          )}
        </Animate>
        {settings.preview && previewImage && (
          <div className="preview">
            <Preview
              key={previewImage?.id}
              onSelectionChange={ onSelectionChange }
              image={previewImage?.canvas}
              selection={previewSelection}
              regions={regions}
              maxWidth={document.body.clientWidth}
              maxHeight={maxPreviewHeight}
              dotColor="#4C8F9F"
            />
          </div>
        )}
        <div className="predicted-categories">
          <PredictedCategories cs={categoryPredictions} />
        </div>
        <div className="predicted-categories">
          <Codes codes={codes} />
        </div>
        <CategoryFilter cats={filterOptions} />
        <div className="wrapper">
          <NodeGroup
            data={results}
            keyAccessor={(r) => r.sku}
            start={(r, i) => ({ opacity: 0, translateX: -100 })}
            enter={(r, i) => ({
              opacity: [1],
              translateX: [0],
              timing: { delay: i * 100, duration: 300 },
            })}
          >
            {(rs) => (
              <>
                {rs.map(({ key, data, state }) => (
                  <Result
                    key={key}
                    noImageUrl={settings.noImageUrl}
                    template={settings.resultTemplate}
                    onImageClick={onImageClick}
                    onLinkClick={onLinkClick}
                    result={data}
                    style={{
                      opacity: state.opacity,
                      transform: `translateX(${state.translateX}%)`,
                    }}
                  />
                ))}
              </>
            )}
          </NodeGroup>

          {(results.length === 0 &&
            showPart === "results" &&
            !loading && (
              <div className="noResults">
                We did not find anything{" "}
                <span role="img" aria-label="sad face">
                  😕
                </span>
              </div>
            ))}

          <br style={{ clear: "both" }} />

          {duration && showPart === "results" && (
            <div
              style={{
                textAlign: "center",
                fontSize: "0.7em",
                paddingTop: "0.8em",
              }}
            >
              Search took {duration.toFixed(2)} seconds
            </div>
          )}

          {requestId && showPart === "results" && (
            <div
              style={{
                textAlign: "center",
                fontSize: "0.7em",
                paddingTop: "0.8em",
              }}
            >
              Request identifier {requestId}
            </div>
          )}
        </div>
      </section>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
      >
        <Alert onClose={() => setToastOpen(false)} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default LandingPageApp;
