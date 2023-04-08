import React, { memo } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Layout from 'components/Layout';
import { ReactNode } from 'components/common';
import App from 'App';
import ResultComponent from 'page/result';

interface PrivateRouteProps {
  component: ReactNode;
  authed: boolean;
  [key: string]: any;
}

const PrivateRoute = ({
  component: Component,
  authed,
  ...rest
}: PrivateRouteProps) => {
  return (
    <Route
      {...rest}
      render={() => (authed ? <Component /> : <Redirect to="/login" />)}
    />
  );
};

function Router(): JSX.Element {
  const accessToken = true;

  return (
    <Switch>
      <Layout>
        <Switch>
          <PrivateRoute
            authed={!!accessToken}
            exact
            strict
            path="/"
            component={App}
          />
          <PrivateRoute
            authed={!!accessToken}
            exact
            strict
            path="/result"
            component={ResultComponent}
          />
        </Switch>
      </Layout>
    </Switch>
  );
}

export default memo(Router);
