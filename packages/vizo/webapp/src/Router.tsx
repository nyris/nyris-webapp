import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Layout from './Layout';
import App from './App';
import ResultComponent from './Results';


function Router(): JSX.Element {
  return (
    <Switch>
      <Switch>
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