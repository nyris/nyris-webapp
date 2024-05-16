import React, {useEffect, useState} from 'react';
import { Route, useHistory } from 'react-router-dom';
import './Layout.scss';
import { ReactComponent as CloseIcon } from './assets/close.svg';
import { ReactComponent as CameraIcon } from './assets/camera.svg';
import SelectModelPopup from './select-model-popup/select-model-popup';
import NyrisAPI, {
  Filter,
  ImageSearchOptions,
  NyrisAPISettings,
  RectCoords,
  Region,
  urlOrBlobToCanvas
} from '@nyris/nyris-api';
import { makeFileHandler } from '@nyris/nyris-react-components';
import DragAndDrop from './components/DragAndDrop';
import ResultComponent from './components/Results';

function Layout() {
  const settings = {apiKey: 'GqjKwUgSXB1mPIihPoZNPVqIZxiKCy3R'} as NyrisAPISettings
  const [searchKey, setSearchKey] = useState<string>('');
  const [results, setResults] = useState<any>([]);
  const [searchImage, setSearchImage] = useState<HTMLCanvasElement | null>(null);
  const [imageThumb, setImageThumb] = useState('');
  const [preFilters, setPreFilters] = useState<Filter>({} as Filter);
  const [selectedPreFilters, setSelectedPreFilters] = useState<string[]>([])
  const history = useHistory();
  const nyrisApi = new NyrisAPI({...settings});

  useEffect(() => {
    const getPreFilters = async () => {
      const resp = await nyrisApi.getFilters(1000);
      const filterdPreFilters = resp.filter(itemResp => itemResp.key === 'Bezeichnung')[0];
      setPreFilters(filterdPreFilters);
    }
    getPreFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const image = await urlOrBlobToCanvas(f);
    setSearchImage(image);
    setImageThumb(URL.createObjectURL(f));
    const foundRegions = await nyrisApi.findRegions(image);
    const selection = getRegionByMaxConfidence(foundRegions);
    const options: ImageSearchOptions = {
      cropRect: selection,
    };
    const searchResult = await nyrisApi.find(options, image);
    setResults(searchResult.results);
    history.push('/results');
  }
  
  const onSelectionChange = (r: RectCoords) => {
    console.log(r);
  }
  
  const SearchBar = <div className="search-bar">
    <div className="text-search-bar">
      <SelectModelPopup
        preFilters={preFilters}
        setPreFilters={(prefilters) => setSelectedPreFilters(prefilters)}
      />
      {imageThumb ? (
        <div className="image-thumb">
          <img src={imageThumb} width={40} alt="searched thumb" />
          <CloseIcon
            width={16}
            height={16}
            fill="#655EE3"
            className="clear-thumb"
            onClick={() => {
              setSearchKey('');
              setResults([]);
              setSearchImage(null);
              setImageThumb('');
              history.push('/');
            }}
          />
        </div>
      ) : (
        ''
      )}
      <input
        className="text-search-bar-input"
        type="text"
        onChange={(e) => setSearchKey(e.target.value)}
        value={searchKey}
        placeholder="Search"
      />
      {searchKey
        ? <CloseIcon
          className="clear-icon"
          width={16}
          height={16}
          fill="#2B2C46"
          onClick={() => setSearchKey('')}
        />
        : ''
      }
      <label
        className="camera-icon"
        htmlFor="nyris__hello-open-camera"
      >
        <CameraIcon />
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

  return (
    <div className="layout">
      <header>
        <img
          src={window.NyrisSettings.logo}
          className="logo"
          alt="logo"
        />
        <div className="user-menu"></div>
      </header>
      <main>
        <>
          <Route
            exact
            strict
            path="/"
            key="DragNDrop"
            render={(props) => (
              <DragAndDrop {...props} search={(e) => imageSearch(e)} searchBar={SearchBar} />
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
              />
            )}
          />
        </>
      </main>
      <footer>
        <a
          href={'https://www.nyris.io'}
          target="_blank"
          rel="noreferrer"
        >
          Powered by <strong>nyris®</strong>
        </a>
      </footer>
    </div>
  )
}

export default Layout;