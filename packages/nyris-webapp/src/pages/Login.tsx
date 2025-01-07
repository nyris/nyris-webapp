import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Login = () => {
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const { auth0 } = window.settings;
  console.log({ auth0 });

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
