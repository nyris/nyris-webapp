import { ReactNode, useState } from 'react';

import { useHistory } from 'react-router-dom';
import { isUndefined } from 'lodash';

import MobilePostFilter from './MobilePostFilter';
import HeaderMobile from './HeaderMobile';

function AppMobile({ children }: { children: ReactNode }) {
  const [isOpenFilter, setOpenFilter] = useState<boolean>(false);

  const history = useHistory();

  return (
    <>
      <div className="wrap-mobile">
        <div className="box-header-mobile-main">
          <HeaderMobile
            onToggleFilterMobile={(show: boolean) => {
              setOpenFilter(isUndefined(show) ? !isOpenFilter : show);
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexGrow: 1,
            flexDirection: 'column',
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '100%',
            backgroundColor: '#fff',
          }}
        >
          {children}
        </div>
        {/* <div
          className="footer-wrap-main"
          style={{
            zIndex: 999,
          }}
        >
          <FooterMobile />
        </div> */}
        {history.location?.pathname === '/' && (
          <footer className="h-11 w-full flex justify-center items-center bg-white">
            <a
              href={'https://www.nyris.io'}
              target="_blank"
              rel="noreferrer"
              className="text-[#AAABB5] md:text-[#2B2C46]"
            >
              <p className="text-xs font-normal text-[#AAABB5] inline">
                Powered by
              </p>
              <p className="text-xs font-bold text-[#AAABB5] inline pl-0.5">
                nyris®
              </p>
            </a>
          </footer>
        )}
      </div>
      <div
        className={`box-filter ${isOpenFilter ? 'open' : 'close'} `}
        style={{
          top: '0px',
          height: '100%',
          width: '100%',
          position: 'absolute',
        }}
      >
        <MobilePostFilter
          isOpenFilter={isOpenFilter}
          onApply={() => {
            setOpenFilter(!isOpenFilter);
          }}
        />
      </div>
    </>
  );
}

export default AppMobile;
