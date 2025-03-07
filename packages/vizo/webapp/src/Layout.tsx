import classNames from 'classnames';

import React, { useMemo, useState, useEffect, useRef } from 'react';

import { Route, useHistory } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import NyrisAPI, {
  NyrisAPISettings,
  RectCoords,
  Region,
  urlOrBlobToCanvas,
} from '@nyris/nyris-api';
import './Layout.scss';
import { ReactComponent as CloseIcon } from './assets/close.svg';
import { ReactComponent as CameraIcon } from './assets/camera.svg';
import { ReactComponent as AvatarIcon } from './assets/avatar.svg';
import { makeFileHandler } from '@nyris/nyris-react-components';
import SelectModelPopup from './components/PreFilter';
import ResultComponent from './page/Results';
import { VizoAgent } from '@nyris/vizo-ai';
import { Chat, MessageType } from './types';
import Home from './page/Home';
import CameraCustom from './components/CameraCustom';
import { isUndefined } from 'lodash';

function Layout() {
  const settings = {
    apiKey: window.settings.apiKey,
  } as NyrisAPISettings;
  const { user, logout } = useAuth0();
  const [searchKey, setSearchKey] = useState<string>('');
  const [results, setResults] = useState<any>([]);
  const [searchImage, setSearchImage] = useState<HTMLCanvasElement | null>(
    null,
  );
  const [imageThumb, setImageThumb] = useState<any>();
  const [selectedPreFilters, setSelectedPreFilters] = useState<string[]>([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [ocr, setOcr] = useState([]);

  const dropdown = useRef<HTMLDivElement>(null);

  const [vizoResultAssessment, setVizoResultAssessment] = useState<{
    filter: boolean;
    ocr: boolean;
    result: string[];
  }>();

  const [vizoLoading, setVizoLoading] = useState(false);
  const [vizoLoadingMessage, setVizoLoadingMessage] = useState('');

  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [filters, setFilters] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [regions, setRegions] = useState<Region[]>([]);
  const [notification, setNotification] = useState(false);

  const history = useHistory();
  const nyrisApi = new NyrisAPI({ ...settings });

  const vizoAgent = useMemo(() => {
    const vizoAgent = new VizoAgent({
      openAiApiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
      groqApiKey: process.env.REACT_APP_GROQ_API_KEY || '',
      customer: window.settings.customer,
      customerDescription: window.settings.customerDescription,
    });

    return vizoAgent;
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!dropdown?.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const onImageUpload = async (f: File) => {
    const image = await urlOrBlobToCanvas(f);
    imageSearch(image);
  };

  const imageSearch = async (image: HTMLCanvasElement, r?: RectCoords) => {
    setSearchImage(image);
    image.toBlob(blob => {
      if (blob) {
        vizoAgent.updateImage(blob);
        setImageThumb(URL.createObjectURL(blob));
      }
    });

    setChatHistory([]);
    vizoAgent.resetAgent();
    setResults([]);
    setVizoResultAssessment(undefined);
    setFilters([]);
    history.push('/results');

    setVizoLoading(true);
    setVizoLoadingMessage('Fetching results...');

    nyrisApi.findRegions(image).then(res => {
      setRegions(res);
    });

    let searchResult: any = { results: [] };

    try {
      searchResult = await nyrisApi.find(
        { cropRect: r },
        image,
        selectedPreFilters.length > 0
          ? [
              {
                key: window.settings.preFilterKey,
                values: selectedPreFilters,
              },
            ]
          : undefined,
        '+ocr.text',
      );
    } catch (error) {}

    vizoAgent.setResults(
      searchResult.results.map(
        ({ image, images, oid, score, ...rest }: any) => rest,
      ),
    );

    if (searchResult?.ocr?.text?.length > 0) {
      setVizoLoadingMessage(
        'Cleaning the captured text and refining your results...',
      );

      vizoAgent
        .refineResult(searchResult?.ocr?.text)
        .then(res => {
          setVizoResultAssessment({
            ocr: true,
            result: res.result.skus,
            filter: false,
          });
          setOcr(res?.result.ocr);

          const response: Chat = {
            type: MessageType.AI,
            message: 'Here is the relevant captured text.',
          };

          response.responseType = 'OCR';
          response.message = 'Here is the relevant captured text.';

          setChatHistory([response]);
          setVizoLoading(false);
          setNotification(true);
        })
        .catch(() => {
          setVizoLoading(false);
        });
    } else if (
      searchResult.results.length < 0 ||
      searchResult.results[0]?.score < 0.5
    ) {
      setVizoLoadingMessage('Analyzing the image for optimal results...');

      vizoAgent
        .runImageAssessment()
        .then(imageAssessment => {
          const { hasValidObject, imageQuality, isRelevantObject } =
            imageAssessment.assessment;

          if (
            (imageQuality === 'poor' || !isRelevantObject || !hasValidObject) &&
            !isUndefined(imageQuality)
          ) {
            const response: Chat = {
              type: MessageType.AI,
              message:
                'The image quality is poor or the object is not recognized. Please upload a new image for better results.',
              responseType: 'upload_new_image',
            };
            setChatHistory([response]);
          }

          setVizoLoading(false);
          setNotification(true);
        })
        .catch(() => {
          setVizoLoading(false);
        });
    } else {
      setVizoLoading(false);
      setNotification(true);
    }

    setResults(searchResult.results);
  };

  const onSelectionChange = (r: RectCoords) => {
    if (searchImage) {
      imageSearch(searchImage, r);
    }
  };

  const onUserQuery = (userQuery: string) => {
    setVizoLoading(true);
    setVizoLoadingMessage('Analyzing results...');

    setChatHistory(s => [
      ...s,
      {
        type: MessageType.USER,
        message: userQuery,
      },
    ]);

    vizoAgent
      .runUserQuery(userQuery)
      .then(res => {
        try {
          const resParsed = JSON.parse(res);
          setChatHistory(s => [
            ...s,
            {
              type: MessageType.AI,
              message: 'Refined result based on your query',
              responseType: 'LLM_response',
            },
          ]);
          setVizoResultAssessment({
            result: resParsed.skus,
            filter: false,
            ocr: false,
          });
        } catch (error) {
          setChatHistory(s => [
            ...s,
            {
              type: MessageType.AI,
              message: res,
              responseType: 'LLM_response',
            },
          ]);
        }

        setNotification(true);
      })
      .finally(() => {
        setVizoLoading(false);
      });
  };

  const onImageRemove = () => {
    setSearchKey('');
    setResults([]);
    setSearchImage(null);
    setImageThumb('');
    history.push('/');
  };

  const SearchBar = (
    <div className="search-bar">
      <div className="text-search-bar">
        <SelectModelPopup
          setPreFilters={prefilters => setSelectedPreFilters(prefilters)}
          selectedPreFilters={selectedPreFilters}
        />
        {imageThumb ? (
          <div className="image-thumb">
            <img src={imageThumb} width={40} alt="searched thumb" />
            <div className="image-thumb-clear">
              <CloseIcon
                width={16}
                height={16}
                fill="#655EE3"
                className="clear-thumb"
                onClick={() => {
                  onImageRemove();
                }}
              />
              <div className="image-thumb-tooltip">Clear image search</div>
            </div>
          </div>
        ) : (
          ''
        )}
        <input
          className="text-search-bar-input"
          type="text"
          onChange={e => setSearchKey(e.target.value)}
          value={searchKey}
          placeholder="Search"
        />
        {searchKey ? (
          <div className="clear-text-search">
            <CloseIcon
              className="clear-icon"
              width={16}
              height={16}
              fill="#2B2C46"
              onClick={() => setSearchKey('')}
            />
            <div className="clear-text-tooltip">Clear text search</div>
          </div>
        ) : (
          ''
        )}
        <label className="camera-icon" htmlFor="nyris__hello-open-camera">
          <CameraIcon />
          <div className="camera-tooltip">Search with an image</div>
        </label>
        <input
          type="file"
          name="take-picture"
          id="nyris__hello-open-camera"
          accept="image/jpeg,image/png,image/webp"
          onChange={makeFileHandler(e => onImageUpload(e))}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );

  // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
  let vh = window.innerHeight * 0.01;
  // Then we set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty('--vh', `${vh}px`);

  useEffect(() => {
    const handleResize = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="layout">
      <header
        className={classNames([
          'fixed',
          'md:relative',
          'w-full',
          'bg-white',
          'z-10',
          'h-12',
          'md:h-14',
        ])}
      >
        <img
          src={window.settings.logo}
          className="logo"
          alt="logo"
          onClick={() => {
            window.location.href = window.location.origin;
          }}
        />
        <div
          ref={dropdown}
          className="user-menu"
          onClick={() => setIsUserMenuOpen(prev => !prev)}
        >
          {user?.email}
          <AvatarIcon className="user-menu-avatar" />
          {isUserMenuOpen ? (
            <div className="user-menu-dropdown">
              <div
                className="user-menu-dropdown-sign-out"
                onClick={() => {
                  logout({
                    logoutParams: { returnTo: window.location.origin },
                  });
                }}
              >
                Sign out
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
      </header>
      <Route
        exact
        strict
        path="/"
        key="home"
        render={(props: any) => (
          <main>
            <Home
              {...props}
              search={e => onImageUpload(e)}
              searchBar={SearchBar}
              setSearchImage={setSearchImage}
              setImageThumb={setImageThumb}
              imageSearch={imageSearch}
              setIsCameraOpen={(val: boolean) => {
                setIsCameraOpen(val);
              }}
              isCameraOpen={isCameraOpen}
              setSelectedPreFilters={setSelectedPreFilters}
              selectedPreFilters={selectedPreFilters}
            />
          </main>
        )}
      />
      <Route
        exact
        strict
        path="/results"
        key="Results"
        render={(props: any) => (
          <ResultComponent
            {...props}
            results={results}
            searchImage={searchImage as HTMLCanvasElement}
            preFilters={selectedPreFilters}
            onSelectionChange={onSelectionChange}
            vizoResultAssessment={vizoResultAssessment}
            ocr={ocr}
            vizoLoading={vizoLoading}
            imageThumb={imageThumb}
            onUserQuery={onUserQuery}
            chatHistory={chatHistory}
            filters={filters}
            imageSearch={onImageUpload}
            regions={regions}
            setIsCameraOpen={(val: boolean) => {
              setIsCameraOpen(val);
            }}
            isCameraOpen={isCameraOpen}
            onImageRemove={onImageRemove}
            setSelectedPreFilters={setSelectedPreFilters}
            selectedPreFilters={selectedPreFilters}
            notification={notification}
            setNotification={setNotification}
            vizoLoadingMessage={vizoLoadingMessage}
          />
        )}
      />
      <div className="block md:hidden">
        {isCameraOpen && (
          <div className="fixed z-50 inset-0 ">
            <CameraCustom
              onCapture={(image: HTMLCanvasElement) => {
                imageSearch(image);
                setIsCameraOpen(false);
              }}
              onClose={() => {
                setIsCameraOpen(false);
              }}
            />
          </div>
        )}
      </div>
      {!isCameraOpen && (
        <footer className="md:border-t bg-transparent md:bg-white border-solid border-[#E0E0E0] pb-1">
          <a
            href={'https://www.nyris.io'}
            target="_blank"
            rel="noreferrer"
            className="text-[#AAABB5] md:text-[#2B2C46]"
          >
            Powered by <strong>nyris®</strong>
          </a>
        </footer>
      )}
    </div>
  );
}

export default Layout;
