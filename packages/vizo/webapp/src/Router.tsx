import React, { useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Layout from "./Layout";
import Login from "./components/Login";
import Logout from "./components/Logout";

function Router(): JSX.Element {
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !user && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [loginWithRedirect, isLoading, user, isAuthenticated]);

  return (
    <Switch>
      <Switch>
        <Route path={"/login"} exact component={Login} />
        <Route path={"/logout"} exact component={Logout} />
        <Layout />
      </Switch>
    </Switch>
  );
}

export default Router;
