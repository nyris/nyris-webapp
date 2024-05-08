import React, { useState } from 'react';
import './Layout.scss';
import { ReactComponent as CloseIcon } from './assets/close.svg';
import { ReactComponent as VizoIcon } from './assets/Vizo.svg';
import { ReactComponent as CameraIcon } from './assets/camera.svg';
import SelectModelPopup from './select-model-popup/select-model-popup';
import NyrisAPI, {ImageSearchOptions, NyrisAPISettings, Region, urlOrBlobToCanvas} from '@nyris/nyris-api';

interface ILayoutProps {
  children: any;
}
function Layout(props: ILayoutProps) {
  const settings = {apiKey: 'GqjKwUgSXB1mPIihPoZNPVqIZxiKCy3R'} as NyrisAPISettings
  const [searchKey, setSearchKey] = useState<string>('');
  const nyrisApi = new NyrisAPI({...settings});

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
  const imageSearch = async (f: File | string) => {
    const image = await urlOrBlobToCanvas(f);
    const foundRegions = await nyrisApi.findRegions(image);
    const selection = getRegionByMaxConfidence(foundRegions);
    const options: ImageSearchOptions = {
      cropRect: selection,
    };
    const searchResult = await nyrisApi.find(options, image);
    console.log(searchResult);
  }

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
        <div className="search-bar">
          <div className="text-search-bar">
            <SelectModelPopup />
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
              onChange={(e) => imageSearch(e.target.value)}
              style={{ display: "none" }}
            />
          </div>
        </div>
        <div>
          {props.children}
        </div>
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