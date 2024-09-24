import React, { memo } from 'react';
import { Route, Switch } from 'react-router-dom';
import Layout from 'components/Layout';
import ResultComponent from 'page/result';
import AuthenticatedRoute from 'components/AuthenticatedRoute';
import Login from 'page/Login';
import Logout from 'page/Logout';
import Home from 'page/landingPage/Home';

function Router(): JSX.Element {
  return (
    <Switch>
      <Switch>
        <Route path={'/login'} exact component={Login} />
        <Route path={'/logout'} exact component={Logout} />

        <Layout>
          <AuthenticatedRoute exact strict path="/" component={Home} />
          <AuthenticatedRoute
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

export default memo(Router);
