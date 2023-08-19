import { Box } from '@material-ui/core';
import { MultipleQueriesQuery } from '@algolia/client-search';
import algoliasearch from 'algoliasearch/lite';
import { ReactNode } from 'components/common';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { InstantSearch } from 'react-instantsearch-dom';
import { useMediaQuery } from 'react-responsive';
import { useHistory } from 'react-router-dom';
import {
  changeValueTextSearch,
  onResetRequestImage,
  setImageCaptureHelpModal,
  setPreFilterDropdown,
  setUpdateSession,
} from 'Store/search/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { AlgoliaSettings, AppState } from '../types';
import './appMobile.scss';
import './common.scss';
import FooterMobile from './FooterMobile';
import HeaderMobile from './HeaderMobile';
import Header from './Header';
import PreFilterComponent from 'components/pre-filter';
import { createSessionByApi } from 'services/session';
import { isUndefined } from 'lodash';
import ImageCaptureHelpModal from './ImageCaptureHelpModal';
import MobilePostFilter from './MobilePostFilter';
import AppMobile from './AppMobile';

function Layout({ children }: ReactNode): JSX.Element {
  const dispatch = useAppDispatch();
  const { settings, search } = useAppSelector<AppState>((state: any) => state);
  const { valueTextSearch, loadingSearchAlgolia } = search;
  const { apiKey, appId, indexName } = settings.algolia as AlgoliaSettings;
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const [isOpenFilter, setOpenFilter] = useState<boolean>(false);
  const history = useHistory();
  let isShowHeaderMobile =
    (isMobile && history.location?.pathname === '/result') ||
    history.location?.pathname === '/';

  useEffect(() => {
    const createSession = async () => {
      let payload = await createSessionByApi(settings);
      dispatch(setUpdateSession(payload));
    };

    createSession().catch(console.log);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (history.location?.pathname === '/') {
      document.title = settings.appTitle || '';
      dispatch(onResetRequestImage(''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.location]);

  let HeaderApp: any;
  let FooterApp: any;
  let classNameBoxVersion: string = 'newVersion';
  if (isMobile) {
    classNameBoxVersion = 'mobile';
    FooterApp = FooterMobile;
    HeaderApp = HeaderMobile;
  } else {
    HeaderApp = Header;
  }

  const conditionalQuery = useMemo(() => {
    const searchClient = algoliasearch(appId, apiKey);
    searchClient.initIndex(indexName);
    return {
      ...searchClient,
      search(requests: MultipleQueriesQuery[]) {
        if (
          requests.every(
            (request: MultipleQueriesQuery) =>
              !request.params?.query &&
              (!request.params?.filters ||
                request.params?.filters.endsWith('<score=1>')),
          )
        ) {
          // Here we have to do something else
          return Promise.resolve({
            results: requests.map(() => ({
              hits: [],
              nbHits: 0,
              nbPages: 0,
              processingTimeMS: 0,
            })),
          });
        }
        return searchClient.search(requests);
      },
    };
  }, [apiKey, appId, indexName]);

  return (
    <div style={{ position: 'relative' }}>
      {loadingSearchAlgolia && (
        <Box className="box-wrap-loading" style={{ zIndex: 99999999 }}>
          <Box className="loadingSpinCT" style={{ top: 0, bottom: 0 }}>
            <Box className="box-content-spin"></Box>
          </Box>
        </Box>
      )}
      <InstantSearch
        indexName={indexName}
        searchClient={conditionalQuery}
        searchState={valueTextSearch}
        onSearchStateChange={state => {
          if (state.page && state.query !== undefined) {
            dispatch(changeValueTextSearch(state));
          }
        }}
      >
        {isMobile && <AppMobile>{children}</AppMobile>}
        {!isMobile && (
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
                  ? { background: settings.theme?.headerColor }
                  : {}),
              }}
            >
              <HeaderApp
                onToggleFilterMobile={(show: boolean) => {
                  setOpenFilter(isUndefined(show) ? !isOpenFilter : show);
                }}
              />
            </div>

            <div className={`box-body-${classNameBoxVersion}-wrap-main`}>
              {children}
            </div>
            {isMobile && (
              <div className="footer-wrap-main">
                <FooterApp />
              </div>
            )}
          </div>
        )}
      </InstantSearch>
    </div>
  );
}

export default memo(Layout);
