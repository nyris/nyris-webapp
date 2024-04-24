import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Route } from 'react-router-dom';
import { useAppSelector } from 'Store/Store';
import NoAccess from './NoAccess';

const AuthenticatedRoute = ({ component, ...rest }: any) => {
  const { auth0 } = useAppSelector(state => state.settings);

  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !user && !isAuthenticated && auth0.enabled) {
      loginWithRedirect();
    }
  }, [loginWithRedirect, isLoading, user, isAuthenticated, auth0]);

  const Component = component;

  return (
    <Route
      {...rest}
      render={props => {
        if (!auth0.enabled) {
          return <Component {...props} />;
        } else if (isAuthenticated && !user?.email_verified) {
          return <NoAccess />;
        } else if (isAuthenticated && user?.email_verified) {
          return <Component {...props} />;
        } else {
          return <div></div>;
        }
      }}
    />
  );
};

export default AuthenticatedRoute;
