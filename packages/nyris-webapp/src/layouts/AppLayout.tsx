import { memo, useCallback, useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router';

import { useAuth0 } from '@auth0/auth0-react';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import '../styles/common.scss';

import PoweredBy from 'components/PoweredBy';
import Header from 'components/Header';
import { translations } from 'translations';

import packageJson from '../../package.json';
import { Configure, useHits, useInstantSearch } from 'react-instantsearch';
import useRequestStore from 'stores/request/requestStore';
import useResultStore from 'stores/result/resultStore';
import useUiStore from 'stores/ui/uiStore';
import { Toaster } from 'components/Toaster';
import { getFilters } from 'services/filter';
import { useUploadSearch } from 'hooks/useUploadSearch';
import { ToastHelper } from 'helpers/ToastHelper';
import { useTranslation } from 'react-i18next';
import {
  clearAuthApiKey,
  isNyrisApiKeyReady,
  useAuthApiKeyStore,
} from 'utils/nyrisApiKey';
import useScopeStore from 'stores/scope/scopeStore';

i18n.use(initReactI18next).init({
  resources: translations,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

function AppLayout(): JSX.Element {
  const { isAuthenticated, logout } = useAuth0();
  const { t } = useTranslation();
  const { auth0, alogoliaFilterField, showPoweredByNyris } = window.settings;
  const { uploadFile } = useUploadSearch();

  const showLayout = !auth0.enabled || (auth0.enabled && isAuthenticated);
  const location = useLocation();
  // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
  let vh = window.innerHeight * 0.01;
  // Then we set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty('--vh', `${vh}px`);

  const query = useRequestStore(state => state.query);

  const algoliaFilter = useRequestStore(state => state.algoliaFilter);
  const metaFilter = useRequestStore(state => state.metaFilter);
  const scopeItemKeys = useScopeStore(state => state.filterAttributes);

  const setAlgoliaProducts = useResultStore(state => state.setAlgoliaProducts);
  const setIsAlgoliaLoading = useUiStore(state => state.setIsAlgoliaLoading);
  const isFindApiLoading = useUiStore(state => state.isFindApiLoading);

  const setIsCadenasLoaded = useUiStore(state => state.setIsCadenasLoaded);
  const specifications = useRequestStore(state => state.specifications);
  const requestImages = useRequestStore(state => state.requestImages);
  const showLoading = useRequestStore(state => state.showLoading);

  const { status } = useInstantSearch();
  const { items } = useHits();

  useEffect(() => {
    i18n.changeLanguage(window.settings.language);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setAlgoliaProducts(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, scopeItemKeys]);

  useEffect(() => {
    if (status === 'loading' || status === 'stalled') {
      setIsAlgoliaLoading(true);
    } else if (status === 'idle') {
      setIsAlgoliaLoading(false);
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const user = useAuth0().user;

  const setPreFilterList = useRequestStore(state => state.setPreFilterList);
  const setPreFilterLoading = useRequestStore(
    state => state.setPreFilterLoading,
  );

  const settings = window.settings;
  const setMetaFilter = useRequestStore(state => state.setMetaFilter);

  const showPreFilter = useMemo(() => {
    if (settings.shouldUseUserMetadata && user) {
      if (user['/user_metadata']?.value) {
        setMetaFilter(user['/user_metadata'].value);
      }
    }

    if (settings.shouldUseUserMetadata && user) {
      if (settings.preFilterOption && !user['/user_metadata']?.value) {
        return true;
      }
      return false;
    }

    return settings.preFilterOption;
  }, [
    setMetaFilter,
    settings.preFilterOption,
    settings.shouldUseUserMetadata,
    user,
  ]);

  const authApiKeyVersion = useAuthApiKeyStore(state => state.version);
  const isMissingAuthApiKey = useAuthApiKeyStore(state => state.isMissingClaim);
  const isApiKeyReady = isNyrisApiKeyReady();

  const getPreFilters = useCallback(async () => {
    if (!isNyrisApiKeyReady()) {
      return;
    }

    setPreFilterLoading(true);
    try {
      const res = await getFilters(1000, settings);
      setPreFilterList(res);
    } catch (e: any) {
      console.log('err getDataFilterDesktop', e);
    } finally {
      setPreFilterLoading(false);
    }
  }, [settings, setPreFilterList, setPreFilterLoading]);

  useEffect(() => {
    if (showPreFilter && !settings.scopeFilter && isApiKeyReady) {
      getPreFilters();
    }
  }, [getPreFilters, showPreFilter, settings.scopeFilter, isApiKeyReady, authApiKeyVersion]);

  const getImageFromClipboard = useCallback(
    (event: ClipboardEvent): File | null => {
      const clipboardData = event.clipboardData;
      if (!clipboardData) {
        return null;
      }

      const imageItem = Array.from(clipboardData.items || []).find(
        item => item.kind === 'file' && item.type.startsWith('image/'),
      );

      if (imageItem) {
        return imageItem.getAsFile();
      }

      return (
        Array.from(clipboardData.files || []).find(file =>
          file.type.startsWith('image/'),
        ) || null
      );
    },
    [],
  );

  const handleClipboardPaste = useCallback(
    (event: ClipboardEvent) => {
      if (isFindApiLoading || showLoading) {
        return;
      }

      const imageFile = getImageFromClipboard(event);
      if (!imageFile) {
        return;
      }

      event.preventDefault();
      ToastHelper.success(
        t('Image pasted from clipboard. Starting visual search.'),
      );
      uploadFile(imageFile, { showPreFilter });
    },
    [
      getImageFromClipboard,
      isFindApiLoading,
      showLoading,
      showPreFilter,
      t,
      uploadFile,
    ],
  );

  useEffect(() => {
    if (!showLayout) {
      return;
    }

    // Auth0: only listen once authApiKey is resolved (not while waiting / missing claim).
    if (auth0.enabled && !isApiKeyReady) {
      return;
    }

    document.addEventListener('paste', handleClipboardPaste);

    return () => {
      document.removeEventListener('paste', handleClipboardPaste);
    };
  }, [auth0.enabled, handleClipboardPaste, isApiKeyReady, showLayout]);

  const applyScopeFilter = (filters: string | undefined) => {
    const scopeFilterClause =
      window.settings.scopeFilter && scopeItemKeys.length
        ? `(${scopeItemKeys[0].values.map(key => `${window.settings.alogoliaFilterField}:'${key}'`).join(' OR ')})`
        : '';

    if (!window.settings.scopeFilter || !window.settings.auth0?.enabled) {
      return filters;
    }

    if (!scopeFilterClause) {
      return `sku:NOT_FOUND`;
    }

    return filters
      ? `${scopeFilterClause} AND (${filters})`
      : scopeFilterClause;
  };

  if (!showLayout) {
    return <Outlet />;
  }

  // Auth0 mode: wait for AuthApiKeySync before rendering search UI / prefilters.
  if (auth0.enabled && !isApiKeyReady && !isMissingAuthApiKey) {
    return <div />;
  }

  if (isMissingAuthApiKey) {
    return (
      <div className="full-height flex flex-col items-center justify-center bg-[#F3F4F8] p-6 text-center">
        <p className="mt-2 max-w-md text-sm text-gray-600">
          Search is currently unavailable for your account. Please contact your
          administrator.
        </p>
        <button
          type="button"
          className="mt-6 bg-[#2B2C46] px-6 py-3 text-sm text-white"
          onClick={() => {
            clearAuthApiKey();
            logout({
              logoutParams: { returnTo: window.location.origin },
            });
          }}
        >
          {t('Log out')}
        </button>
      </div>
    );
  }

  return (
    <div className="full-height flex flex-col bg-[#F3F4F8]">
      <div>
        <Toaster />
      </div>
      <Header />
      {window.settings?.algolia.enabled && (
        <Configure
          query={query}
          filters={applyScopeFilter(
            specifications && !requestImages.length
              ? `${alogoliaFilterField}:'${specifications.prefilter_value}'`
              : !query && !algoliaFilter.includes('score=1')
                ? undefined
                : `${algoliaFilter}${
                    metaFilter
                      ? `${
                          algoliaFilter ? 'AND ' : ''
                        }${alogoliaFilterField}:'${metaFilter}'`
                      : ''
                  }`,
          )}
          // facets={['brand', 'keyword_0']}
          hitsPerPage={20}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
      {showPoweredByNyris && (
        <PoweredBy
          className={
            location.pathname === '/result'
              ? 'hidden'
              : 'flex w-full justify-center items-center mb-2'
          }
        />
      )}
    </div>
  );
}

export default memo(AppLayout);
