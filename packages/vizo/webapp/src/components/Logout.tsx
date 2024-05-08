import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Logout = () => {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } =
    useAuth0();

  useEffect(() => {
    if (!isLoading && !user && !isAuthenticated) {
      loginWithRedirect();
    } else if (isAuthenticated) {
      logout({ logoutParams: { returnTo: window.location.origin } });
    } 
  }, [loginWithRedirect, isAuthenticated, isLoading, user, logout]);

  return <div></div>;
};

export default Logout;
