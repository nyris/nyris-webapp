import { useAuth0 } from '@auth0/auth0-react';
import EmailVerification from 'components/EmailVerification';
import { useEffect, useRef, ReactElement } from 'react';
import { getScopes } from 'services/filter';
import useScopeStore from 'stores/scope/scopeStore';

export default function ProtectedRoute({
  children,
}: {
  children: ReactElement;
}) {
  const { auth0, scopeFilter } = window.settings;

  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const setScope = useScopeStore(state => state.setScope);
  const setScopeLoading = useScopeStore(state => state.setScopeLoading);
  const hasFetchedScope = useRef(false);

  useEffect(() => {
    if (!isLoading && !user && !isAuthenticated && auth0.enabled) {
      loginWithRedirect();
    }
  }, [loginWithRedirect, isLoading, user, isAuthenticated, auth0]);

  useEffect(() => {
    if (
      !scopeFilter ||
      !isAuthenticated ||
      !user?.email ||
      hasFetchedScope.current
    ) {
      return;
    }
    hasFetchedScope.current = true;
    setScopeLoading(true);
    getScopes('ishaan1090@gmail.com', window.settings)
      .then(response => {
        setScope(response.itemKeys || [], response.filterAttributes || []);
      })
      .catch((e: any) => {
        console.log('err getScopes', e);
      })
      .finally(() => {
        setScopeLoading(false);
      });
  }, [scopeFilter, isAuthenticated, user, setScope, setScopeLoading]);

  if (!auth0.enabled) {
    return children;
  }

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  if (!isLoading && isAuthenticated && user?.email_verified) {
    return children;
  }

  if (!isLoading && isAuthenticated && !user?.email_verified) {
    return <EmailVerification />;
  }

  return <div></div>;
}
