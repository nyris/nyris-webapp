import React, { useEffect, useState } from 'react';

import eye from './eye.svg';
import camera from './images/camera.svg';

import { ReactComponent as Logo } from './images/logo.svg';
import { ReactComponent as DeutscheLogo } from './images/deutsche_logo.svg';
import { ReactComponent as CloseButton } from './images/close.svg';
import { ReactComponent as Plus } from './images/plus.svg';
import { ReactComponent as Down } from './images/chevron_down.svg';

import './styles/nyris.scss';

import classNames from 'classnames';
import { useDropzone } from 'react-dropzone';
import translations from './translations';
import { addAssets } from './utils';
import PreFilter from './Components/PreFilter';
import Modal from './Components/Modal';
import { LoadingSpinner } from './Components/Loading';
import { Result } from './Components/Result';
import { AppProps, CadenasScriptStatus, WidgetScreen } from './types';

const labels = translations(window.nyrisSettings.language);
const assets_base_url =
  'https://assets.nyris.io/nyris-widget/cadenas/8.1.0/api';
declare var psol: any;

const Wait = () => (
  <div className="nyris__screen nyris__wait">
    <div className="nyris__main-heading">{labels['Hold on']}</div>
    <div className="nyris__main-description">
      {labels['We are working hard on finding the product']}
    </div>
    <LoadingSpinner description={labels['Analyzing image...']} />
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
  selectedPreFilters,
}: AppProps) => {
  const [currentSelection, setCurrentSelection] = useState(selection);
  const isMobile = document.body.clientWidth < 512;

  const acceptCrop = () =>
    onAcceptCrop(currentSelection, Object.keys(selectedPreFilters));
  // @ts-ignore
  const showPreview = image && image.type !== 'error';

  return (
    <div className="nyris__screen nyris__fail">
      <div className="nyris__main-heading">{errorMessage}</div>
      <div className="nyris__main-description">
        <div>{labels['Oops!']}</div>
      </div>
      <div className="nyris__fail-content">
        <label
          className="nyris__button-accept"
          htmlFor="nyris__hello-open-camera"
        >
          <span>
            {isMobile ? labels['Click a picture'] : labels['Upload a picture']}
          </span>
          <img src={camera} width={16} height={16} />
        </label>
        <input
          type="file"
          name="take-picture"
          id="nyris__hello-open-camera"
          accept="image/jpeg,image/png"
          onChange={(f: any) => onFile(f, Object.keys(selectedPreFilters))}
          capture="environment"
          style={{
            display: 'none',
          }}
        />
      </div>
    </div>
  );
};

const Hello = ({
  onFile,
  onFileDropped,
  getPreFilters,
  searchFilters,
  selectedPreFilters,
  setSelectedPreFilters,
}: AppProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preFilter, setPreFilter] = useState({});
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (fs: File[]) => {
      onFileDropped(fs[0], Object.keys(selectedPreFilters));
    },
  });

  const logo =
    window.nyrisSettings.language === 'en' ? (
      <Logo fill={window.nyrisSettings.primaryColor} width={320} height={134} />
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
            width={window.nyrisSettings.logoWidth || 320}
          />
        ) : (
          logo
        )}
      </div>
      <div className="nyris__hello-wrapper">
        {window.nyrisSettings.searchCriteriaKey && (
          <div
            className={`nyris__hello-prefilter-button ${
              Object.keys(selectedPreFilters).length > 0 ? 'selected' : ''
            }`}
            onClick={() => {
              setIsModalOpen(true);
              setLoading(true);
              getPreFilters().then(res => {
                setPreFilter(res);
                setLoading(false);
              });
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {Object.keys(selectedPreFilters).length > 0 && (
                <div className="nyris__hello-prefilter-selected-tag"></div>
              )}

              <div style={{ height: '' }}>
                {window.nyrisSettings.searchCriteriaLabel}
              </div>
            </div>
            <div
              style={{
                width: '16px',
                height: '16px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Down color="#2B2C46" />
            </div>
          </div>
        )}

        <div
          className={`nyris__main-content nyris__main-content--mobile ${
            window.nyrisSettings.searchCriteriaKey ? 'col' : ''
          }`}
        >
          <label
            className="nyris__hello-browse"
            htmlFor="nyris__hello-upload-input"
            style={{
              color: window.nyrisSettings.primaryColor,
              backgroundColor: window.nyrisSettings.browseGalleryButtonColor,
              width: window.nyrisSettings.searchCriteriaKey ? '50%' : '',
            }}
          >
            {labels['Browse gallery']}
          </label>
          <label
            className="nyris__hello-upload"
            style={{
              backgroundColor: window.nyrisSettings.primaryColor,
              width: window.nyrisSettings.searchCriteriaKey ? '50%' : '',
            }}
            htmlFor="nyris__hello-open-camera"
          >
            {labels['Take a photo']}
            {!window.nyrisSettings.searchCriteriaKey && (
              <img src={camera} width={16} height={16} />
            )}
          </label>
        </div>

        <div className="nyris__main-content nyris__main-content--desktop">
          {/* <label
            className="nyris__hello-upload"
            style={{ backgroundColor: window.nyrisSettings.primaryColor }}
            htmlFor="nyris__hello-upload-input"
          >
            {labels["Upload a picture"]}
            <img src={camera} width={16} height={16} />
          </label> */}
          {/*  */}

          <div
            className={`nyris__hello-drop-zone ${
              isDragActive ? 'active-drop' : ''
            }`}
            {...getRootProps()}
          >
            <Plus width={24} height={24} color="#55566B" />
            <div>
              <span className="nyris__hello-drop-zone-bold-text">
                {labels['Drag an image or click to upload']}
              </span>
            </div>
          </div>
        </div>
        <input
          {...getInputProps()}
          type="file"
          name="file"
          id="select_file"
          className="inputFile"
          placeholder="Choose photo"
          style={{ display: 'block', cursor: 'pointer' }}
        />
        <input
          type="file"
          name="upload"
          id="nyris__hello-upload-input"
          onChange={(f: any) => onFile(f, Object.keys(selectedPreFilters))}
          accept="image/jpeg,image/png,image/webp"
        />
        <input
          type="file"
          name="take-picture"
          id="nyris__hello-open-camera"
          accept="image/jpeg,image/png"
          onChange={(f: any) => onFile(f, Object.keys(selectedPreFilters))}
          capture="environment"
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <PreFilter
          onClose={() => {
            setIsModalOpen(false);
          }}
          preFilter={preFilter}
          loading={loading}
          setSelectedPreFilters={setSelectedPreFilters}
          selectedPreFilters={selectedPreFilters}
          searchFilters={value => {
            if (!value) {
              getPreFilters().then(res => {
                setPreFilter(res);
              });
              return;
            }

            searchFilters(
              window.nyrisSettings.searchCriteriaKey,
              encodeURIComponent(value),
            )
              .then(res => {
                setPreFilter(res);
              })
              .catch((e: any) => {
                console.log('err filterSearchHandler', e);
              });
          }}
        />
      </Modal>
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
  } = props;

  let content = null;
  let wide = false;
  let resultsSingle = false;
  let resultsMultiple = false;
  const [selectedPreFilters, setSelectedPreFilters] = useState<string[]>([]);
  const [postFilter, setPostFilter] = useState<any>({});

  const [cadenasScriptStatus, setCadenasScriptStatus] =
    useState<CadenasScriptStatus>('disabled');

  useEffect(() => {
    if (window.nyrisSettings.cadenasAPIKey) {
      setCadenasScriptStatus('loading');
      addAssets([`${assets_base_url}/css/psol.components.min.css`]).catch(
        (error: any) => {
          setCadenasScriptStatus('failed');
        },
      );

      addAssets([`${assets_base_url}/js/thirdparty.min.js`])
        .then(() => {
          addAssets([`${assets_base_url}/js/psol.components.min.js`])
            .then(() => {
              setCadenasScriptStatus('ready');
            })
            .catch((error: any) => {
              setCadenasScriptStatus('failed');
            });
        })
        .catch((error: any) => {
          setCadenasScriptStatus('failed');
        });
    }
  }, []);

  useEffect(() => {
    if (showScreen === WidgetScreen.Hello) {
      setPostFilter({});
    }
  }, [showScreen]);

  switch (showScreen) {
    case WidgetScreen.Hello:
      content = (
        <Hello
          {...props}
          setSelectedPreFilters={setSelectedPreFilters}
          selectedPreFilters={selectedPreFilters}
        />
      );
      break;
    case WidgetScreen.Wait:
      content = <Wait />;
      break;
    case WidgetScreen.Fail:
      content = (
        <Fail
          {...props}
          errorMessage={labels['Something went wrong']}
          setSelectedPreFilters={setSelectedPreFilters}
          selectedPreFilters={selectedPreFilters}
        />
      );
      break;
    case WidgetScreen.Result:
      content = (
        <Result
          {...props}
          cadenasScriptStatus={cadenasScriptStatus}
          setSelectedPreFilters={setSelectedPreFilters}
          selectedPreFilters={selectedPreFilters}
          setPostFilter={setPostFilter}
          postFilter={postFilter}
        />
      );
      wide = true;
      resultsMultiple = true;
      break;
  }

  const divMainClassNames = classNames({
    nyris__main: true,
    'nyris__main--wide': wide,
    nyrisMultipleProducts: resultsMultiple,
    nyrisSingleProduct: resultsSingle,
  });
  const showPoweredByNyris = !process.env.IS_ENTERPRISE;
  return (
    <React.Fragment>
      {showScreen != WidgetScreen.Hidden && (
        <>
          <div
            className="nyris__background"
            onClick={() => {
              setSelectedPreFilters([]);
              onClose();
            }}
          />
          <div className="nyris__wrapper">
            <div className={divMainClassNames}>
              <div className="nyris__header">
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <CloseButton
                    onClick={() => {
                      setSelectedPreFilters([]);
                      onClose();
                    }}
                    width={8}
                    color="#2B2C46"
                  />
                </div>
              </div>
              {content}
              <div
                className="nyris__footer"
                style={{
                  paddingBottom:
                    showScreen == WidgetScreen.Result && results?.length > 0
                      ? showPoweredByNyris
                        ? '80px'
                        : '50px'
                      : '',
                }}
              >
                {showPoweredByNyris && (
                  <a target="_blank" href="https://nyris.io/">
                    Powered by{' '}
                    <span className="nyris__footer-logo">nyris®</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      {showVisualSearchIcon && (
        <div className="nyris__icon" onClick={onToggle}>
          <img src={eye} width={38} height={22} />
        </div>
      )}
    </React.Fragment>
  );
};

export default App;
