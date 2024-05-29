import React, { useMemo, useState, useEffect, useRef } from "react";
import { Route, useHistory } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import NyrisAPI, {
  ImageSearchOptions,
  NyrisAPISettings,
  RectCoords,
  Region,
  urlOrBlobToCanvas,
} from "@nyris/nyris-api";
import "./Layout.scss";
import { ReactComponent as CloseIcon } from "./assets/close.svg";
import { ReactComponent as CameraIcon } from "./assets/camera.svg";
import { ReactComponent as AvatarIcon } from './assets/avatar.svg';
import { makeFileHandler } from "@nyris/nyris-react-components";
import SelectModelPopup from "./components/PreFilter";
import DragAndDrop from "./components/DragAndDrop";
import ResultComponent from "./components/Results";
import { VizoAgent } from "@nyris/vizo-ai";


function Layout() {
  const settings = {
    apiKey: window.settings.apiKey,
  } as NyrisAPISettings;
  const { user, logout } = useAuth0();
  const [searchKey, setSearchKey] = useState<string>("");
  const [results, setResults] = useState<any>([]);
  const [searchImage, setSearchImage] = useState<HTMLCanvasElement | null>(
    null
  );
  const [imageThumb, setImageThumb] = useState("");
  const [selectedPreFilters, setSelectedPreFilters] = useState<string[]>([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdown = useRef<HTMLDivElement>(null);

  const [vizoResultAssessment, setVizoResultAssessment] = useState<{
    filter: boolean;
    ocr: boolean;
    result: string[];
  }>();

  const [vizoLoading, setVizoLoading] = useState(false);

  const history = useHistory();
  const nyrisApi = new NyrisAPI({ ...settings });

  const vizoAgent = useMemo(() => {
    const vizoAgent = new VizoAgent({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY || "",
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

  const getRegionByMaxConfidence = (regions: Region[]) => {
    if (regions.length === 0) {
      return { x1: 0, x2: 1, y1: 0, y2: 1 };
    }
    const regionWithMaxConfidence = regions.reduce((prev, current) => {
      prev.confidence = prev.confidence || 0;
      current.confidence = current.confidence || 0;
      return prev.confidence >= current.confidence ? prev : current;
    });
    return regionWithMaxConfidence.normalizedRect;
  };

  const imageSearch = async (f: File) => {
    vizoAgent.resetAgent();
    vizoAgent.updateImage(f);

    const image = await urlOrBlobToCanvas(f);
    setSearchImage(image);
    setImageThumb(URL.createObjectURL(f));
    const foundRegions = await nyrisApi.findRegions(image);
    const selection = getRegionByMaxConfidence(foundRegions);
    const options: ImageSearchOptions = {
      cropRect: selection,
    };

    const searchResult = await nyrisApi.find(options, image);
    vizoAgent.setResults(searchResult.results);

    setVizoLoading(true);
    vizoAgent.runImageAssessment().then((imageAssessment) => {
      vizoAgent.refineResult().then((res) => {
        setVizoResultAssessment(res);
        setVizoLoading(false);
      });
    });

    setResults(searchResult.results);
    history.push("/results");
  };

  const onSelectionChange = (r: RectCoords) => {
    console.log(r);
  };

  const SearchBar = (
    <div className="search-bar">
      <div className="text-search-bar">
        <SelectModelPopup
          setPreFilters={(prefilters) => setSelectedPreFilters(prefilters)}
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
                  setSearchKey("");
                  setResults([]);
                  setSearchImage(null);
                  setImageThumb("");
                  history.push("/");
                }}
              />
              <div className="image-thumb-tooltip">Clear image search</div>
            </div>
          </div>
        ) : (
          ""
        )}
        <input
          className="text-search-bar-input"
          type="text"
          onChange={(e) => setSearchKey(e.target.value)}
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
              onClick={() => setSearchKey("")}
            />
            <div className="clear-text-tooltip">Clear text search</div>
          </div>
        ) : (
          ""
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
          onChange={makeFileHandler((e) => imageSearch(e))}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );

  return (
    <div className="layout">
      <header>
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
          onClick={() => setIsUserMenuOpen((prev) => !prev)}
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
      <main>
        <>
          <Route
            exact
            strict
            path="/"
            key="DragNDrop"
            render={(props) => (
              <DragAndDrop
                {...props}
                search={(e) => imageSearch(e)}
                searchBar={SearchBar}
              />
            )}
          />
          <Route
            exact
            strict
            path="/results"
            key="Results"
            render={(props) => (
              <ResultComponent
                {...props}
                results={results}
                searchBar={SearchBar}
                searchImage={searchImage}
                preFilters={selectedPreFilters}
                onSelectionChange={onSelectionChange}
                vizoResultAssessment={vizoResultAssessment}
                ocr={vizoAgent.ocrResult}
                vizoLoading={vizoLoading}
              />
            )}
          />
        </>
      </main>
      <footer>
        <a href={"https://www.nyris.io"} target="_blank" rel="noreferrer">
          Powered by <strong>nyris®</strong>
        </a>
      </footer>
    </div>
  );
}

export default Layout;
