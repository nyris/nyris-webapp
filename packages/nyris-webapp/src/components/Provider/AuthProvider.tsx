import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { useAppSelector } from 'Store/Store';

const AuthProvider = ({ children }: any) => {
  const settings = useAppSelector(state => state.settings);

  if (!settings.auth0.enabled) {
    return <>{children}</>;
  }

  return (
    <Auth0Provider
      domain={settings.auth0.domain || ''}
      clientId={settings.auth0.clientId || ''}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      {children}
    </Auth0Provider>
  );
};

export default AuthProvider;