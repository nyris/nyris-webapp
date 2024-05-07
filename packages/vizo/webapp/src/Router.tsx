import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Layout from './Layout';
import App from './App';
import ResultComponent from './Results';
import Login from './Login';
import Logout from './Logout';


function Router(): JSX.Element {
  return (
    <Switch>
      <Switch>
        <Route path={'/login'} exact component={Login} />
        <Route path={'/logout'} exact component={Logout} />
        <Layout>
          <Route exact strict path="/" component={App} />
          <Route
            exact
            strict
            path="/result"
            component={ResultComponent}
          />
        </Layout>
      </Switch>
    </Switch>
  );
}

export default Router;