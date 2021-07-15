import { Route, Switch } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { Main } from '@redhat-cloud-services/frontend-components/Main/Main';

const Cluster = lazy(() =>
  import(
    /* webpackChunkName: "ClusterDetails" */ './PresentationalComponents/Cluster/Cluster'
  )
);

const paths = [
  {
    title: 'Clusters',
    path: '/clusters/:clusterId',
    component: Cluster,
  },
];

/**
 * the Switch component changes routes depending on the path.
 *
 * Route properties:
 *      exact - path must match exactly,
 *      path - https://prod.foo.redhat.com:1337/insights/advisor/rules
 *      component - component to be rendered when a route has been chosen.
 */
export const Routes = () => (
  <Suspense
    fallback={
      <Bullseye>
        <Spinner />
      </Bullseye>
    }
  >
    <Switch>
      {paths.map((path) => (
        <Route key={path.title} path={path.path} component={path.component} />
      ))}
      {/* Finally, catch all unmatched routes */}
      <Route path="*" component={() => <Main>No page found</Main>} />
    </Switch>
  </Suspense>
);
