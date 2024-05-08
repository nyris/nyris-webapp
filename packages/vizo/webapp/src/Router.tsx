import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Layout from './Layout';
import DragAndDrop from './components/DragAndDrop';
import ResultComponent from './components/Results';
import Login from './components/Login';
import Logout from './components/Logout';


function Router(): JSX.Element {
  return (
    <Switch>
      <Switch>
        <Route path={'/login'} exact component={Login} />
        <Route path={'/logout'} exact component={Logout} />
        <Layout>
          <Route exact strict path="/" component={DragAndDrop} />
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