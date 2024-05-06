import React, { useState } from 'react';
import './App.scss';
import { ReactComponent as CloseIcon } from './assets/close.svg';
interface ILayoutProps {
  children: any;
}
function Layout(props: ILayoutProps) {
  const [searchKey, setSearchKey] = useState<string>('');
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
          <input
            className="search-bar-input"
            type="text"
            onChange={(e) => setSearchKey(e.target.value)}
            value={searchKey}
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
        <div>
          {props.children}
        </div>
      </main>
      <footer>
        <a href={'https://www.nyris.io'} target="_blank">Powered by <strong>nyris</strong></a>
      </footer>
    </div>
  )
}

export default Layout;