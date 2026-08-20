import { useAuth0 } from '@auth0/auth0-react';
import EmailVerification from 'components/EmailVerification';
import ScopeMissing from 'components/ScopeMissing';
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
  const filterAttributes = useScopeStore(state => state.filterAttributes);

  const setScopeLoading = useScopeStore(state => state.setScopeLoading);
  const scopeIsLoading = useScopeStore(state => state.isLoading);

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
    getScopes(user.email, window.settings)
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

  if (isLoading || !isAuthenticated) {
    return <div></div>;
  }

  if (!user?.email_verified) {
    return <EmailVerification />;
  }

  if (scopeFilter) {
    // wait for the scope fetch to finish before deciding access, otherwise ScopeMissing flashes early
    if (scopeIsLoading || !hasFetchedScope.current) {
      return <div></div>;
    }

    if (filterAttributes.length === 0) {
      return <ScopeMissing />;
    }
  }

  return children;
}
