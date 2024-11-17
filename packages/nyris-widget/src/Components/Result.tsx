import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Preview } from "@nyris/nyris-react-components";
import { RectCoords } from "@nyris/nyris-api";

import { AppProps } from "../App";
import { debounce } from "lodash";
import translations from "../translations";

import crop from "../images/crop.svg";
import collapse from "../images/collapse.svg";
import trash from "../images/trash.svg";
import camera from "../images/camera.svg";

import { ReactComponent as GoBack } from "../images/path.svg";

import { LoadingSpinner } from "./Loading";
import { ProductCard } from "./Product";
import Feedback from "./Feedback";

const labels = translations(window.nyrisSettings.language);

export const Result = ({
  onAcceptCrop,
  results,
  onSimilarSearch,
  image,
  regions,
  selection,
  onRestart,
  onFile,
  loading,
  onGoBack,
  firstSearchImage,
  cadenasScriptStatus,
  submitFeedback,
  feedbackStatus,
  setFeedbackStatus,
  selectedPreFilters,
}: AppProps) => {
  const noResult = results.length === 0;

  const [currentSelection, setCurrentSelection] = useState(selection);
  const [expand, setExpand] = useState(noResult);

  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);
  const handleSubmitFeedback = async (data: boolean) => {
    setShowFeedbackSuccess(true);
    setTimeout(() => {
      setShowFeedbackSuccess(false);
    }, 3000);
    setFeedbackStatus("submitted");
    submitFeedback(data).then(() => {});
  };

  const debouncedOnImageSelectionChange = useCallback(
    debounce((r: RectCoords) => {
      onAcceptCrop(r, selectedPreFiltersLabel);
    }, 500),
    []
  );

  useEffect(() => {
    if (
      results?.length === 0 ||
      feedbackStatus === "submitted" ||
      feedbackStatus === "visible" ||
      !window.nyrisSettings.feedback
    ) {
      return;
    }

    const handleScroll = () => {
      setFeedbackStatus("visible");
    };

    window.addEventListener("scroll", handleScroll, {
      capture: true,
      once: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [feedbackStatus, results]);

  const selectedPreFiltersLabel = useMemo(
    () => Object.keys(selectedPreFilters),
    [selectedPreFilters]
  );

  return (
    <>
      <div className="nyris__screen nyris__success-multiple">
        <div className="nyris__main-heading ">
          {noResult ? labels["Let’s try that again"] : labels["Success!"]}
        </div>
        <div className="nyris__main-description">
          {noResult && labels["We couldn’t find matches"]}
          {!noResult && (
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              <div style={{ fontWeight: "bold" }}>{results.length}</div>{" "}
              <div>{labels["matches found"]}</div>
              {selectedPreFiltersLabel.length > 0 && (
                <>
                  <div>based on </div>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {selectedPreFiltersLabel.map((value, index) => {
                      return (
                        <React.Fragment key={index}>
                          <div style={{ fontWeight: "bold" }}>{value}</div>
                          {index != selectedPreFiltersLabel.length - 1 && (
                            <div
                              style={{
                                paddingRight: "4px",
                                paddingLeft: "2px",
                              }}
                            >
                              {index === selectedPreFiltersLabel.length - 2
                                ? "and"
                                : ","}
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
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
              onChange={(f: any) => {
                onFile(f, selectedPreFiltersLabel);
              }}
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

          {loading && (
            <LoadingSpinner description={labels["Analyzing image..."]} />
          )}
          {!loading && (
            <>
              {image !== firstSearchImage ? (
                <div className="go-back-button" onClick={() => onGoBack()}>
                  <GoBack width={16} height={16} />
                  {labels["Back to request image"]}
                </div>
              ) : (
                ""
              )}
              <div className="nyris__success-multiple-result-list">
                {results.map((r, i) => (
                  <ProductCard
                    {...r}
                    key={i}
                    onSimilarSearch={(f: any) => {
                      onSimilarSearch(f, selectedPreFiltersLabel);
                    }}
                    cadenasScriptStatus={cadenasScriptStatus}
                  />
                ))}
              </div>
              {showFeedbackSuccess && (
                <div className="nyris__feedback-section">
                  <div className="nyris__feedback-success">
                    Thanks for your feedback!
                  </div>
                </div>
              )}
              {feedbackStatus === "visible" && !showFeedbackSuccess && (
                <div className="nyris__feedback-section">
                  <Feedback
                    submitFeedback={handleSubmitFeedback}
                    onFeedbackClose={() => {
                      setFeedbackStatus("submitted");
                    }}
                  />
                </div>
              )}
            </>
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
