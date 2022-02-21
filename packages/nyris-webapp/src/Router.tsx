import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
// import Page404 from "Page/Exception/404";
import Login from "page/Auth/login";
import Layout from "components/Layout";
import { ReactNode } from "components/common";
import App from "App";

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
      <Route exact strict path="/login" component={Login} />
      <Layout>
        <Switch>
          <PrivateRoute
            authed={!!accessToken}
            exact
            strict
            path="/"
            component={App}
          />
        </Switch>
      </Layout>
    </Switch>
  );
}

export default Router;
