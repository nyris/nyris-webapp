import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Login = () => {
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !user && !isAuthenticated) {
      loginWithRedirect();
    } else if (isAuthenticated) {
      window.location.href = '/';
    }
  }, [loginWithRedirect, isLoading, user, isAuthenticated]);

  return <div></div>;
};

export default Login;
