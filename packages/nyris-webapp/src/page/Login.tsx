import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAppSelector } from 'Store/Store';

const Login = () => {
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const { auth0 } = useAppSelector(state => state.settings);

  useEffect(() => {
    if (!isLoading && !user && !isAuthenticated && auth0.enabled) {
      loginWithRedirect();
    }
    if (isAuthenticated || !auth0.enabled) {
      window.location.href = '/';
    }
  }, [loginWithRedirect, isLoading, user, isAuthenticated, auth0]);

  return <div></div>;
};

export default Login;
