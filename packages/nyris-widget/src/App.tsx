import React, { useState } from "react";
import eye from "./eye.svg";
import close_light from "./images/close_light.svg";
import close_dark from "./images/close_dark.svg";
import drop_zone from "./images/dropzone.svg";
import spinner from "./images/spinner.svg";
import button from "./images/button.svg";
import button2 from "./images/button2.svg";
import button_restart from "./images/button_restart.svg";
import button_reselect from "./images/button_reselect.svg";
import "./styles/nyris.scss";
import { Result, ResultProps } from "./Result";
import { RectCoords, Region } from "@nyris/nyris-api";
import { Preview } from "@nyris/nyris-react-components";
import classNames from "classnames";
import { useDropzone } from "react-dropzone";

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
  onClose: () => void;
  onRestart: () => void;
  onRefine: () => void;
  onToggle: () => void;
  onFile: (f: any) => void;
  onFileDropped: (f: File) => void;
  onAcceptCrop: (r: RectCoords) => void;
}

const SuccessSingle = ({
  onRefine,
  result,
}: AppProps & { result: ResultProps }) => (
  <div className="nyris__screen nyris__success-single">
    <div className="nyris__main-heading">Success!</div>
    <div className="nyris__main-description">
      We’ve found 1 relevant product:
    </div>
    <div className="nyris__main-content">
      <a
        className="nyris__success-single-image"
        href={result.link}
        style={{ backgroundImage: `url("${result.imageUrl}")` }}
      />
      <div className="nyris__success-single-image-panel">
        <div className="nyris__success-single-panel-name">{result.title}</div>
        <div className="nyris__success-single-panel-description">
          {result.price}
        </div>
      </div>

      <div className="nyris__success-single-note">
        Not exactly what you were looking for?
      </div>
      <div
        className="nyris__button nyris__button--icon-left nyris__success-single-refine"
        onClick={onRefine}
      >
        <img src={button} width={18} height={18} />
        <span>Refine your search</span>
      </div>
    </div>
  </div>
);

const SuccessMultiple = ({ onRefine, thumbnailUrl, results }: AppProps) => (
  <div className="nyris__screen nyris__success-multiple">
    <div className="nyris__main-heading ">Success!</div>
    <div className="nyris__main-description">
      We’ve found
      <span className="nyris__success-multiple-count">
        {" "}
        {results.length}
      </span>{" "}
      similar products:
    </div>
    <div className="nyris__main-content">
      <div className="nyris__success-multiple-summary">
        <div
          className="nyris__success-multiple-thumb"
          style={{ backgroundImage: `url(${thumbnailUrl})` }}
        />
        <div className="nyris__success-multiple-desc">
          <div className="nyris__success-multiple-name" />
        </div>
        <div
          onClick={onRefine}
          className="nyris__button nyris__button--icon-right nyris__success-multiple-refine"
        >
          <span>Refine</span>
          <img src={button2} width={18} height={18} />
        </div>
      </div>
      <div className="nyris__success-multiple-result-list">
        {results.map((r, i) => (
          <Result {...r} key={i} />
        ))}
      </div>
    </div>
  </div>
);

const Wait = () => (
  <div className="nyris__screen nyris__wait">
    <div className="nyris__main-heading">Hold on</div>
    <div className="nyris__main-description">
      We’re working hard on finding the product
    </div>
    <div className="nyris__main-content">
      <div className="nyris__wait-spinner">
        <img src={spinner} width={66} height={66} />
      </div>
      <div className="nyris--purple">Analyzing image...</div>
    </div>
  </div>
);

const Reselect = ({ onAcceptCrop, image, regions, selection }: AppProps) => {
  const [currentSelection, setCurrentSelection] = useState(selection);

  const acceptCrop = () => onAcceptCrop(currentSelection);
  return (
    <div className="nyris__screen nyris__reselect">
      <div className="nyris__main-heading">Reselect focus area</div>
      <div className="nyris__main-description">
        Select one of our focus points or crop the image area
      </div>
      <div className="nyris__main-content">
        <div className="nyris__reselect-image-wrapper">
          <Preview
            image={image}
            selection={currentSelection}
            onSelectionChange={setCurrentSelection}
            regions={regions}
            maxWidth={400}
            maxHeight={400}
            dotColor="#FF0000"
          />
        </div>
      </div>
      <div
        className="nyris__button nyris__reselect-accept"
        onClick={acceptCrop}
      >
        Accept & proceed
      </div>
    </div>
  );
};

const Fail = ({ errorMessage, onRestart, onRefine }: AppProps) => (
  <div className="nyris__screen nyris__fail">
    <div className="nyris__main-heading">Bummer!</div>
    <div className="nyris__main-description">
      <p>{errorMessage}</p>
      <p>
        <br />
        <br />
        Unfortunately we could not find any relevant matches for your search.
        Perhaps your photo is tilted, blurry or cropped?
      </p>
      <p>
        Please read our <a href="https://nyris.io/">Guidelines</a> and try
        again.
      </p>
    </div>
    <div className="nyris__main-content">
      <div
        className="nyris__button nyris__button--icon-right nyris__fail-restart"
        onClick={onRestart}
      >
        <span>Start new search</span>
        <img src={button_restart} width={16} height={10} />
      </div>
      <div
        className="nyris__button nyris__button--icon-left nyris__button--ghost nyris__fail-reselect"
        onClick={onRefine}
      >
        <img width={18} height={18} src={button_reselect} />
        <span>Reselect focus area</span>
      </div>
      <a
        href="https://nyris.io/"
        className="nyris__button nyris__button--ghost"
      >
        <span>Go to Guidelines</span>
      </a>
    </div>
  </div>
);

const Hello = ({ onFile, onFileDropped }: AppProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (fs: File[]) => onFileDropped(fs[0]),
  });
  return (
    <div className="nyris__screen nyris__hello">
      <div className="nyris__main-heading nyris__main-heading--big">Hello!</div>
      <div className="nyris__main-description">
        Start your visual search here
      </div>
      <div className="nyris__main-content nyris__main-content--mobile">
        <label className="nyris__button" htmlFor="nyris__hello-upload-input">
          Pick from Camera Roll
        </label>
        <label className="nyris__button" htmlFor="nyris__hello-open-camera">
          Open Camera
        </label>
      </div>
      <div className="nyris__main-content nyris__main-content--desktop">
        <div className="nyris__hello-drop-zone" {...getRootProps()}>
          <img src={drop_zone} width={27} height={30} />
          <div>Drop your images here</div>
        </div>
        <label
          className="nyris__button nyris__hello-upload"
          htmlFor="nyris__hello-upload-input"
        >
          Upload from your device
        </label>
      </div>
      <input
        type="file"
        name="upload"
        id="nyris__hello-upload-input"
        accept="image/*"
        onChange={onFile}
        {...getInputProps()}
      />
      <input
        type="file"
        name="take-picture"
        id="nyris__hello-open-camera"
        accept="image/*"
        onChange={onFile}
        capture="environment"
      />
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
      content = <Fail {...props} />;
      break;
    case Screen.Result:
      switch (results.length) {
        case 0:
          let cprops = { ...props, errorMessage: "No results" };
          content = <Fail {...cprops} />;
          break;
        case 1:
          const result = props.results[0];
          content = <SuccessSingle {...props} result={result} />;
          resultsSingle = true;
          break;
        default:
          content = <SuccessMultiple {...props} />;
          wide = true;
          resultsMultiple = true;
          break;
      }
      break;
    case Screen.Refine:
      content = <Reselect {...props} />;
      break;
  }

  const divMainClassNames = classNames({
    nyris__main: true,
    "nyris__main--wide": wide,
    nyrisMultipleProducts: resultsMultiple,
    nyrisSingleProduct: resultsSingle,
  });

  return (
    <React.Fragment>
      {showScreen != Screen.Hidden && (
        <div className={divMainClassNames}>
          <div className="nyris__close" onClick={onClose}>
            <div className="nyris__close-text">Close</div>
            <img
              className="nyris__close-light"
              src={close_light}
              width={8}
              height={8}
            />
            <img
              className="nyris__close-dark"
              src={close_dark}
              width={8}
              height={8}
            />
          </div>
          <div className="nyris__container">{content}</div>
          <div className="nyris__footer">
            <span style={{ display: "none" }}>
              <a href="https://nyris.io/">Help</a> &middot;
              <a href="https://nyris.io/">About us</a>
            </span>
            <span>
              Powered by <a href="https://nyris.io/">nyris</a>{" "}
            </span>
          </div>
        </div>
      )}
      <div className="nyris__icon" onClick={onToggle} onDrop={onFile}>
        <img src={eye} width={38} height={22} />
        <div className="nyris__icon-text">Try our visual search</div>
      </div>
    </React.Fragment>
  );
};

export default App;
