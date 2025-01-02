import { memo, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

import { useAuth0 } from '@auth0/auth0-react';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import '../styles/common.scss';

import Footer from 'components/Footer';
import Header from 'components/Header';
import { translations } from 'translations';

import packageJson from '../../package.json';
import { Configure, useHits, useInstantSearch } from 'react-instantsearch';
import useRequestStore from 'stores/request/requestStore';
import useResultStore from 'stores/result/resultStore';
import useUiStore from 'stores/ui/uiStore';
import { Toaster } from 'components/Toaster';

i18n.use(initReactI18next).init({
  resources: translations,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

function AppLayout(): JSX.Element {
  const { isAuthenticated } = useAuth0();
  const { auth0, alogoliaFilterField, showPoweredByNyris } = window.settings;

  const showLayout = !auth0.enabled || (auth0.enabled && isAuthenticated);
  const location = useLocation();
  // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
  let vh = window.innerHeight * 0.01;
  // Then we set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty('--vh', `${vh}px`);

  const query = useRequestStore(state => state.query);

  const algoliaFilter = useRequestStore(state => state.algoliaFilter);
  const metaFilter = useRequestStore(state => state.metaFilter);

  const setAlgoliaProducts = useResultStore(state => state.setAlgoliaProducts);
  const setIsAlgoliaLoading = useUiStore(state => state.setIsAlgoliaLoading);

  const setIsCadenasLoaded = useUiStore(state => state.setIsCadenasLoaded);

  const { status } = useInstantSearch();
  const { items } = useHits();

  useEffect(() => {
    console.log('App version:', packageJson.version);

    const handleResize = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    window.addEventListener('resize', handleResize);

    const handleScriptsLoaded = () => {
      setIsCadenasLoaded(true);
    };

    window.addEventListener('cadenasScriptsLoaded', handleScriptsLoaded);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('cadenasScriptsLoaded', handleScriptsLoaded);
    };
  }, []);

  useEffect(() => {
    setAlgoliaProducts(items);
  }, [items]);

  useEffect(() => {
    if (status === 'loading' || status === 'stalled') {
      setIsAlgoliaLoading(true);
    } else if (status === 'idle') {
      setIsAlgoliaLoading(false);
    }
    return () => {};
  }, [status]);

  if (!showLayout) {
    return <Outlet />;
  }

  return (
    <div className="full-height flex flex-col">
      <div>
        <Toaster />
      </div>
      <Header />
      <Configure
        query={query}
        filters={
          !query && !algoliaFilter.includes('score=1')
            ? undefined
            : `${algoliaFilter}${
                metaFilter
                  ? `${
                      algoliaFilter ? 'AND ' : ''
                    }${alogoliaFilterField}:'${metaFilter}'`
                  : ''
              }`
        }
        // facets={['brand', 'keyword_0']}
        hitsPerPage={20}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
      {showPoweredByNyris && (
        <Footer
          className={
            location.pathname === '/result' ? 'hidden desktop:flex' : 'flex'
          }
        />
      )}
    </div>
  );
}

export default memo(AppLayout);
