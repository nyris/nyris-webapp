import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
// import Page404 from "Page/Exception/404";
import Login from "page/Auth/login";
import Layout from "components/Layout";
import { ReactNode } from "components/common";
import App from "App";
import ResultComponent from "page/result";
import SearchHistory from "page/History";
import Saved from "page/Saved";
import Profile from "page/Profile";
import SupportPage from "page/Support";
// import TestComponent from "page/Test";

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
          <PrivateRoute
            authed={!!accessToken}
            exact
            strict
            path="/result"
            component={ResultComponent}
          />
          <PrivateRoute
            authed={!!accessToken}
            exact
            strict
            path="/search-history"
            component={SearchHistory}
          />
          <PrivateRoute
            authed={!!accessToken}
            exact
            strict
            path="/saved"
            component={Saved}
          />
          <PrivateRoute
            authed={!!accessToken}
            exact
            strict
            path="/account"
            component={Profile}
          />
          <PrivateRoute
            authed={!!accessToken}
            exact
            strict
            path="/support"
            component={SupportPage}
          />
          {/* <PrivateRoute
            authed={!!accessToken}
            exact
            strict
            path="/test"
            component={TestComponent}
          /> */}
        </Switch>
      </Layout>
    </Switch>
  );
}

export default Router;
