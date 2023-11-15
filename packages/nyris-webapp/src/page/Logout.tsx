import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAppSelector } from 'Store/Store';

const Logout = () => {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } =
    useAuth0();
  const { auth0 } = useAppSelector(state => state.settings);

  useEffect(() => {
    if (!isLoading && !user && !isAuthenticated && auth0.enabled) {
      loginWithRedirect();
    } else if (isAuthenticated) {
      logout({ logoutParams: { returnTo: window.location.origin } });
    } else if (!auth0.enabled) {
      window.location.href = '/';
    }
  }, [loginWithRedirect, isAuthenticated, isLoading, user, logout, auth0]);

  return <div></div>;
};

export default Logout;
