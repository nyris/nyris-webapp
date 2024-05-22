import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Layout from './Layout';
import Login from './components/Login';
import Logout from './components/Logout';


function Router(): JSX.Element {
  return (
    <Switch>
      <Switch>
        <Route path={'/login'} exact component={Login} />
        <Route path={'/logout'} exact component={Logout} />
        <Layout />
      </Switch>
    </Switch>
  );
}

export default Router;