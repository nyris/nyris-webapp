import { Box } from '@material-ui/core';
import React, { useState } from 'react';
import { memo } from 'react';
import { connectStateResults } from 'react-instantsearch-dom';
import { useMediaQuery } from 'react-responsive';
import { useHistory } from 'react-router-dom';
import { setPreFilterDropdown } from 'Store/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { AlgoliaSettings, AppState } from 'types';
import FooterComponent from './Footer';
import FooterMD from './FooterMD';
import FooterMobile from './FooterMobile';
import FooterNewVersion from './FooterNewVersion';
import HeaderComponent from './Header';
import HeaderMdComponent from './HeaderMd';
import HeaderMobile from './HeaderMobile';
import HeaderNewVersion from './HeaderNewVersion';
import ExpandablePanelComponent from './PanelResult';
import FilterComponent from './pre-filter/desktop';

function AppContainerComponent({
  isSearchStalled,
  children,
}: any): JSX.Element {
  const dispatch = useAppDispatch();
  const { settings, search } = useAppSelector<AppState>((state: any) => state);
  const { fetchingResults, loadingSearchAlgolia, preFilterDropdown } = search;
  const { themePage } = settings;
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const [isOpenFilter, setOpenFilter] = useState<boolean>(false);
  const history = useHistory();
  let isShowHeaderMobile =
    (isMobile && history.location?.pathname === '/result') ||
    history.location?.pathname === '/';

  let HeaderApp: any;
  let FooterApp: any;
  let classNameBoxVersion: string = 'newVersion';
  if (isMobile) {
    classNameBoxVersion = 'mobile';
    FooterApp = FooterMobile;
    HeaderApp = HeaderMobile;
  } else {
    if (themePage.default?.active) {
      classNameBoxVersion = 'default';

      HeaderApp = HeaderComponent;
      FooterApp = FooterComponent;
    } else if (themePage.materialDesign?.active) {
      classNameBoxVersion = 'materialDesign';
      HeaderApp = HeaderMdComponent;
      FooterApp = FooterMD;
    } else {
      HeaderApp = HeaderNewVersion;
      FooterApp = FooterNewVersion;
    }
  }

  return (
    <>
      {(loadingSearchAlgolia || fetchingResults || isSearchStalled) && (
        <Box className="box-wrap-loading" style={{ zIndex: 99999999 }}>
          <Box className="loadingSpinCT" style={{ top: 0, bottom: 0 }}>
            <Box className="box-content-spin"></Box>
          </Box>
        </Box>
      )}
      <div className={`layout-main-${classNameBoxVersion}`}>
        <div
          className={
            !isMobile
              ? `box-header-${classNameBoxVersion}-main`
              : isShowHeaderMobile
              ? `box-header-${classNameBoxVersion}-main`
              : ''
          }
          style={{
            ...(classNameBoxVersion === 'newVersion'
              ? { background: settings.themePage.searchSuite?.headerColor }
              : {}),
          }}
        >
          <HeaderApp
            onToggleFilterMobile={() => {
              setOpenFilter(!isOpenFilter);
            }}
          />
        </div>

        <div className={`box-body-${classNameBoxVersion}-wrap-main`}>
          {children}
        </div>
        <div className="footer-wrap-main">
          <FooterApp />
        </div>
      </div>
      {isMobile && (
        <Box
          className={`box-fillter ${isOpenFilter ? 'open' : 'close'} `}
          position={'absolute'}
        >
          <ExpandablePanelComponent
            onToogleApplyFillter={() => {
              setOpenFilter(!isOpenFilter);
            }}
          />
        </Box>
      )}
      {isMobile && preFilterDropdown && (
        <Box className={`box-fillter open`} position={'absolute'}>
          <div className={'wrap-filter-destop'}>
            <div className={'bg-white box-filter-destop isMobile'}>
              <FilterComponent
                handleClose={() =>
                  dispatch(setPreFilterDropdown(!preFilterDropdown))
                }
              />
            </div>
          </div>
        </Box>
      )}
    </>
  );
}
const AppContainer = connectStateResults(memo(AppContainerComponent));
export default AppContainer;
