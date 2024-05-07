import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import './App.scss';
import { ReactComponent as CloseIcon } from './assets/close.svg';
import drop_zone from './assets/dropzone.svg';
interface ILayoutProps {
  children: any;
}
function Layout(props: ILayoutProps) {
  const [searchKey, setSearchKey] = useState<string>('');
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (fs: File[]) => onFileDropped(fs[0]),
  });

  const onFileDropped = (file: any) => {
    console.log(file);
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
          <div className="ask-vizo">
            Ask Vizo!
          </div>
          <div className="text-search-bar">
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