import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import {
  applyAuthApiKey,
  clearAuthApiKey,
  readAuthApiKeyFromUser,
} from 'utils/nyrisApiKey';

/**
 * Keeps window.settings.apiKey in sync with Auth0 claim
 * `https://nyris.io/authApiKey`.
 * Must only render inside Auth0Provider when auth0.enabled is true.
 */
export function AuthApiKeySync() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      clearAuthApiKey();
      return;
    }

    const authApiKey = readAuthApiKeyFromUser(
      user as Record<string, unknown>,
    );
    applyAuthApiKey(authApiKey);
  }, [user, isAuthenticated, isLoading]);

  return null;
}
