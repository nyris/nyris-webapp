import React, { useEffect, useRef, useState, useMemo } from 'react';

import eye from './eye.svg';
import { ReactComponent as Camera } from './images/camera.svg';
import { ReactComponent as CloseButton } from './images/close.svg';
import { ReactComponent as Plus } from './images/plus.svg';
import { ReactComponent as Down } from './images/chevron_down.svg';
import { ReactComponent as Triangle } from './images/triangle_down.svg';
import { ReactComponent as FrenchLogo} from './images/French.svg';
import { ReactComponent as DeutscheLogo } from './images/deutsche_logo.svg';
import { ReactComponent as Logo } from './images/logo.svg';
import { ReactComponent as DanishLogo } from './images/Danish.svg';
import { ReactComponent as DutchLogo } from './images/Dutch.svg';
import { ReactComponent as ItalianLogo } from './images/Italian.svg';
import { ReactComponent as NorwegianLogo } from './images/Norwegian.svg';
import { ReactComponent as PolishLogo } from './images/Polish.svg';
import { ReactComponent as RussianLogo } from './images/Russian.svg';
import { ReactComponent as SpanishLogo } from './images/Spanish.svg';
import { ReactComponent as SwedishLogo } from './images/Swedish.svg';

import './styles/nyris.scss';

import classNames from 'classnames';
import { useDropzone } from 'react-dropzone';
import translations from './translations';
import { addAssets } from './utils';
import PreFilter from './Components/PreFilter';
import Modal from './Components/Modal';
import { LoadingSpinner } from './Components/Loading';
import { Result } from './Components/Result';
import { AppProps, CadenasScriptStatus, Language, WidgetScreen } from './types';
import { WebCameraModal } from './Components/WebCameraModal';

const assets_base_url =
  'https://assets.nyris.io/nyris-widget/cadenas/8.1.0/api';
declare var psol: any;

const languages = [
  {
    label: 'Deutsch (DE)',
    value: 'de',
  },
  {
    label: 'English (EN)',
    value: 'en',
  },
  {
    label: 'Français (FR)',
    value: 'fr',
  },
  {
    label: 'Polski (PL)',
    value: 'pl',
  },
  {
    label: 'Italiano (IT)',
    value: 'it',
  },
  {
    label: 'Dansk (DA)',
    value: 'da',
  },
  {
    label: 'Svenska (SE)',
    value: 'se',
  },
  {
    label: 'Español (ES)',
    value: 'es',
  },
  {
    label: 'Nederlands (NL)',
    value: 'nl',
  },
  {
    label: 'Norsk (NO)',
    value: 'no',
  },
  {
    label: 'Руский (RU)',
    value: 'ru'
  },
]

const Wait = ({ labels }: any) => (
  <div className="nyris__screen nyris__wait">
    <div className="nyris__main-heading">{labels['Hold on']}</div>
    <div className="nyris__main-description">
      {labels['We are working hard on finding the product']}
    </div>
    <LoadingSpinner description={labels['Analyzing image...']} />
  </div>
);

const Fail = ({
  onRestart,
  onAcceptCrop,
  image,
  regions,
  selection,
  onFile,
  selectedPreFilters,
  labels,
}: AppProps) => {
  const [currentSelection, setCurrentSelection] = useState(selection);
  const isMobile = document.body.clientWidth < 512;

  const acceptCrop = () =>
    onAcceptCrop(currentSelection, Object.keys(selectedPreFilters));
  // @ts-ignore
  const showPreview = image && image.type !== 'error';

  return (
    <div className="nyris__screen nyris__fail">
      <div className="nyris__main-heading">{labels['Something went wrong']}</div>
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
          <Camera width={16} height={16} />
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
  labels,
  language,
}: AppProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preFilter, setPreFilter] = useState({});
  const [loading, setLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (fs: File[]) => {
      onFileDropped(fs[0], Object.keys(selectedPreFilters));
    },
  });

  const logos: Record<string, any> = {
    en: <Logo fill={window.nyrisSettings.primaryColor} />,
    fr: <FrenchLogo style={{ color: window.nyrisSettings.primaryColor}}  />,
    de: <DeutscheLogo fill={window.nyrisSettings.primaryColor} />,
    da: <DanishLogo style={{ color: window.nyrisSettings.primaryColor}} />,
    nl: <DutchLogo style={{ color: window.nyrisSettings.primaryColor}} />,
    it: <ItalianLogo style={{ color: window.nyrisSettings.primaryColor}} />,
    no: <NorwegianLogo style={{ color: window.nyrisSettings.primaryColor}} />,
    pl: <PolishLogo style={{ color: window.nyrisSettings.primaryColor}} width={380}/>,
    es: <SpanishLogo style={{ color: window.nyrisSettings.primaryColor}} />,
    se: <SwedishLogo style={{ color: window.nyrisSettings.primaryColor}} />,
    ru: <RussianLogo style={{ color: window.nyrisSettings.primaryColor}} width={380} />,
  };

  const logoElement = useMemo(() => logos[language] || logos[window.nyrisSettings.language], [language]);


  return (
    <div className="nyris__screen nyris__hello">
      <div className="nyris__logo">
        {window.nyrisSettings.customerLogo ? (
          <img
            src={window.nyrisSettings.customerLogo}
            width={window.nyrisSettings.logoWidth || 320}
          />
        ) : (
          logoElement
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
          <div
            className="nyris__hello-upload"
            style={{
              backgroundColor: window.nyrisSettings.primaryColor,
              width: window.nyrisSettings.searchCriteriaKey ? '50%' : '',
            }}
            onClick={() => setIsCameraOpen(true)}
          >
            {labels['Take a photo']}
            {!window.nyrisSettings.searchCriteriaKey && (
              <Camera width={16} height={16} />
            )}
          </div>
        </div>

        <Modal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          className="web-camera"
        >
          <WebCameraModal
            handlerFindImage={(f: any) => {
              setIsCameraOpen(false);
              onFile(f, Object.keys(selectedPreFilters));
            }}
            onClose={() => setIsCameraOpen(false)}
          />
        </Modal>

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
          labels={labels}
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
  const [language, setLanguage] = useState<any>(window.nyrisSettings.language.toLowerCase());
  const [selectedPreFilters, setSelectedPreFilters] = useState<string[]>([]);
  const [postFilter, setPostFilter] = useState<any>({});
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const labels = translations(language);

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

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        !languageDropdownRef?.current?.contains(event.target as Node) &&
        !languageDropdownRef?.current?.contains(event.target as Node)
      ) {
        setIsLanguagesOpen(false);
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  switch (showScreen) {
    case WidgetScreen.Hello:
      content = (
        <Hello
          {...props}
          setSelectedPreFilters={setSelectedPreFilters}
          selectedPreFilters={selectedPreFilters}
          labels={labels}
          language={language}
        />
      );
      break;
    case WidgetScreen.Wait:
      content = <Wait labels={labels} />;
      break;
    case WidgetScreen.Fail:
      content = (
        <Fail
          {...props}
          setSelectedPreFilters={setSelectedPreFilters}
          selectedPreFilters={selectedPreFilters}
          labels={labels}
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
          labels={labels}
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
              setIsLanguagesOpen(false);
            }}
          />
          <div className="nyris__wrapper">
            <div className={divMainClassNames}>
              <div className="nyris__header">
                <div
                  style={{
                    width: '100px',
                    height: '16px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginTop: 8,
                  }}
                >
                  <div
                    className="nyris__header-language"
                    ref={languageDropdownRef}
                  >
                    <div
                      className={`nyris__header-language-label ${isLanguagesOpen ? 'open' : ''}`}
                      style={{ '--border-color': window.nyrisSettings.primaryColor } as React.CSSProperties}
                      onClick={() => setIsLanguagesOpen((prev) => !prev)}
                    >
                      {language.toUpperCase()}
                      {isLanguagesOpen ? (
                        <Triangle style={{ transform: 'rotate(180deg)'}} />
                      ) : (
                        <Triangle />
                      )}
                    </div>
                    {isLanguagesOpen ? (
                      <div
                          className="nyris__header-language-list"
                          style={{ '--hover-color': window.nyrisSettings.primaryColor } as React.CSSProperties}
                      >
                        {languages.map((languageItem) => (
                          <div
                            className="nyris__header-language-list-item"
                            onClick={() => {
                              setLanguage(languageItem.value as Language);
                              setIsLanguagesOpen(false);
                            }}
                          >
                            {languageItem.label}
                          </div>
                        ))}
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                  <CloseButton
                    onClick={() => {
                      setSelectedPreFilters([]);
                      onClose();
                      setIsLanguagesOpen(false);
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
                        : '0'
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
