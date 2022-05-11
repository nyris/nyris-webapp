import "App.css";
import React, { useCallback, useEffect, useState } from "react";
import Result from "components/Result";
import ExampleImages from "components/ExampleImages";
import CategoryFilter from "components/CategoryFilter";
import PredictedCategories from "components/PredictedCategories";
import Codes from "components/Codes";
import {
  Code,
  CategoryPrediction,
  RectCoords,
  Region,
  cadExtensions,
  isCadFile,
  isImageFile,
  ImageSearchOptions,
} from "@nyris/nyris-api";
import { useDropzone } from "react-dropzone";
import classNames from "classnames";
import { Animate, NodeGroup } from "react-move";
import { AppSettings, MDSettings, CanvasWithId } from "types";
import {
  makeFileHandler,
  Capture, Preview,
} from "@nyris/nyris-react-components";
import { Snackbar } from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";

import { useAppDispatch, useAppSelector } from "Store/Store";
import {
  loadCadFileLoad,
  setSearchResults,
  loadFileSelectRegion,
  loadingActionRegions,
  loadingActionResults,
  searchFileImageNonRegion,
} from "Store/Search";
import {
  NyrisAppPart,
  NyrisFeedbackState,
  showCamera,
  showFeedback,
  showResults,
  showStart,
} from "Store/Nyris";
import { serviceImage, serviceImageNonRegion } from "services/image";
import { findByImage } from "services/findByImage";
import { debounce, isEmpty } from "lodash";
import { feedbackClickEpic } from "services/Feedback";
export interface AppHandlers {
  onExampleImageClick: (url: string) => void;
  onImageClick: (position: number, url: string) => void;
  onLinkClick: (position: number, url: string) => void;
  onFileDropped: (file: File) => void;
  onCaptureComplete: (image: HTMLCanvasElement) => void;
  onCaptureCanceled: () => void;
  onSelectFile: (f: File) => void;
  onCameraClick: () => void;
  onShowStart: () => void;
  onSelectionChange: (r: RectCoords) => void;
  onPositiveFeedback: () => void;
  onNegativeFeedback: () => void;
  onCloseFeedback: () => void;
}

export interface AppProps {
  search: {
    results: any[];
    requestId?: string;
    duration?: number;
    categoryPredictions: CategoryPrediction[];
    codes: Code[];
    filterOptions: string[];
    errorMessage?: string;
    regions: Region[];
    previewSelection: RectCoords;
    toastErrorMessage?: string;
  };
  previewImage?: CanvasWithId;
  settings: AppSettings;
  loading: boolean;
  showPart: NyrisAppPart;
  feedbackState: NyrisFeedbackState;
  handlers: AppHandlers;
  mdSettings: MDSettings;
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const LandingPageApp = () => {
  const dispatch = useAppDispatch();
  const searchState = useAppSelector((state) => state);
  const [toastOpen, setToastOpen] = useState(false);
  const [rectCoords, setRectCoords] = useState<any>();
  const defaultSelection = {x1: 0.1, x2: 0.9, y1: 0.1, y2: 0.9};
  const [selection, setSelection] = useState<RectCoords>(defaultSelection);

  const { settings, search, nyris } = searchState;
  const {
    errorMessage,
    results,
    requestId,
    fetchingRegions,
    fetchingResults,
    requestImage,
    regions,
    selectedRegion,
    categoryPredictions,
    codes,
    filterOptions,
    duration,
  } = search;
  const { showPart } = nyris;

  const isDefaultRect = (r: RectCoords) => r.x1 === 0 && r.x2 === 1 && r.y1 === 0 && r.y2 === 1;

  // update selection, if it is not the default one
  useEffect(() => {
    if (!isDefaultRect(selectedRegion)) {
      setSelection(selectedRegion);
    }
  }, [selectedRegion]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (fs: File[]) => {
      // console.log("fsssssssss", fs);
      serviceImage(fs[0], searchState.settings).then((res) => {
        dispatch(setSearchResults(res));
        return dispatch(showFeedback());
      });
      // return dispatch(loadFile(fs[0]));
    },
  });
  const minPreviewHeight = 400;
  const halfOfTheScreenHeight = Math.floor(window.innerHeight * 0.45);
  const maxPreviewHeight = Math.max(minPreviewHeight, halfOfTheScreenHeight);

  useEffect(() => {
    if (isEmpty(rectCoords)) {
      return;
    }
    onSearchOffersForImage(rectCoords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rectCoords]);

  const acceptTypes = ["image/*"]
    .concat(settings.cadSearch ? cadExtensions : [])
    .join(",");

  useEffect(() => {
    if (errorMessage !== "") {
      setToastOpen(true);
    }
  }, [errorMessage]);

  function scrollTop() {
    // TODO might require polyfill for ios and edge
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }

  const onShowStart = () => {
    dispatch(showStart(""));
    scrollTop();
  };

  const onLinkClick = (_position: number, url: string) => {
    feedbackClickEpic(searchState, _position).catch(console.warn);
    if (url) {
      window.open(url);
    }
  };
  // TODO: search image file home page
  const isCheckImageFile = (file: any) => {
    dispatch(showResults());
    dispatch(loadingActionResults());
    dispatch(showFeedback());
    if (isImageFile(file) || typeof file === "string") {
      return serviceImage(file, searchState.settings).then((res) => {
        return dispatch(setSearchResults(res));
      });
    }
    if (isCadFile(file)) {
      return dispatch(loadCadFileLoad(file));
    }
  };
  //

  const searchByUrl = (url: string, position?: number) => {
    dispatch(showResults());
    dispatch(loadingActionResults());
    if (position) {
      feedbackClickEpic(searchState, position);
    }

    if (settings.regions) {
      serviceImage(url, searchState.settings).then((res) => {
        dispatch(setSearchResults(res));
        return dispatch(showFeedback());
      });
    } else {
      serviceImageNonRegion(url, searchState, rectCoords).then((res) => {
        dispatch(searchFileImageNonRegion(res));
      });
    }
  };

  const handlerRectCoords = debounce((value) => {
    return setRectCoords(value);
  }, 1200);

  const debouncedSetRectCoords = useCallback(
    (value) => handlerRectCoords(value),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onSearchOffersForImage = (r: RectCoords) => {
    const { canvas }: any = requestImage;
    let options: ImageSearchOptions = {
      cropRect: r,
    };
    dispatch(loadingActionRegions());
    return findByImage(canvas, options, settings).then((res) => {
      dispatch(loadFileSelectRegion(res));
      return dispatch(showFeedback());
    });
  };

  return (
    <div>
      {showPart === "camera" && (
        <Capture
          onCaptureComplete={(image: HTMLCanvasElement) => {
            return isCheckImageFile(image);
          }}
          onCaptureCanceled={() => dispatch(showStart)}
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
                onClick={() => dispatch(showCamera)}
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
                onChange={makeFileHandler((e) => {
                  return isCheckImageFile(e);
                })}
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
              onExampleImageClicked={(url: string) => {
                return searchByUrl(url);
              }}
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
          show={fetchingRegions || fetchingResults}
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
        {settings.preview && requestImage && (
          <div className="preview">
            <Preview
              key={requestImage?.id}
              onSelectionChange={(r: RectCoords) => {
                setSelection(r);
                debouncedSetRectCoords(r);
                return;
              }}
              image={requestImage?.canvas}
              selection={selection}
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
                    onImageClick={(_pos, url) => {
                      return searchByUrl(url, _pos);
                    }}
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
            fetchingRegions) ||
            (fetchingResults && (
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
