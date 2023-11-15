import { Box } from '@material-ui/core';
import { ReactNode } from 'components/common';
import React, { memo, useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useHistory } from 'react-router-dom';
import { onResetRequestImage, setUpdateSession } from 'Store/search/Search';
import { useAppDispatch, useAppSelector } from 'Store/Store';
import { AppState } from '../types';
import './appMobile.scss';
import './common.scss';
import FooterMobile from './FooterMobile';
import HeaderMobile from './HeaderMobile';
import Header from './Header';
import { createSessionByApi } from 'services/session';
import { isUndefined } from 'lodash';
import AppMobile from './AppMobile';
import jQuery from 'jquery';
import Loading from './Loading';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from 'translations';
import { useAuth0 } from '@auth0/auth0-react';
import InstantSearchProvider from './Provider/InstantSearchProvider';

declare var psol: any;

jQuery(document).ready(function () {
  psol.core.setApiKey('66c56a38010f4a81a82f6ed51c903399');
  psol.core.setUserInfo({
    server_type: 'oem_apps_cadenas_webcomponentsdemo',
    title: 'Herr',
    firstname: 'Max',
    lastname: 'Mustermann',
    userfirm: 'CADENAS GmbH',
    street: 'Berliner Allee 28 b+c',
    zip: '86153',
    city: 'Augsburg',
    country: 'de',
    phone: '+49 (0) 821 2 58 58 0-0',
    fax: '+49 (0) 821 2 58 58 0-999',
    email: 'info@cadenas.de',
  });
  psol.core.setServiceBaseUrl('https://webapi.partcommunity.com');
});

i18n.use(initReactI18next).init({
  resources: translations,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

function Layout({ children }: ReactNode): JSX.Element {
  const dispatch = useAppDispatch();
  const { settings, search } = useAppSelector<AppState>((state: any) => state);
  const { loadingSearchAlgolia } = search;
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const [isOpenFilter, setOpenFilter] = useState<boolean>(false);
  const history = useHistory();
  let isShowHeaderMobile =
    (isMobile && history.location?.pathname === '/result') ||
    history.location?.pathname === '/';
  const language = useAppSelector(state => state.settings.language);
  const { isAuthenticated } = useAuth0();
  const { auth0 } = settings;
  const showApp = !auth0.enabled || (auth0.enabled && isAuthenticated);
  i18n.changeLanguage(language);

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
    <div style={{ position: 'relative' }}>
      {loadingSearchAlgolia && (
        <Box className="box-wrap-loading" style={{ zIndex: 99999999 }}>
          <Loading />
        </Box>
      )}
      <InstantSearchProvider>
        {isMobile && showApp && <AppMobile>{children}</AppMobile>}
        {!isMobile && showApp && (
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
        {!showApp && <> {children}</>}
      </InstantSearchProvider>
    </div>
  );
}

export default memo(Layout);
