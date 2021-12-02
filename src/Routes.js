import { Route, Switch, Redirect } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import Main from '@redhat-cloud-services/frontend-components/Main';

import { Bullseye } from '@patternfly/react-core/dist/js/layouts/Bullseye';
import { Spinner } from '@patternfly/react-core/dist/js/components/Spinner';
import { ComingSoon } from '../src/Components/MessageState/EmptyStates';

const Cluster = lazy(() =>
  import(/* webpackChunkName: "ClusterDetails" */ './Components/Cluster')
);

const Recommendation = lazy(() =>
  import(/* webpackChunkName: "Recommendation" */ './Components/Recommendation')
);

const RecsList = lazy(() =>
  import(/* webpackChunkName: "RecsList" */ './Components/RecsList')
);

const paths = [
  {
    title: 'Clusters',
    path: '/clusters/:clusterId',
    component: Cluster,
  },
  {
    title: 'Recommendations',
    path: '/recommendations/:recommendationId',
    component: Recommendation,
  },
  {
    title: 'Recommendations',
    path: '/recommendations',
    component: RecsList,
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
      <Redirect exact from="/" to="/recommendations" />
      {/* Finally, catch all unmatched routes */}
      <Route
        path="*"
        component={() => (
          <Main>
            <ComingSoon />
          </Main>
        )}
      />
    </Switch>
  </Suspense>
);
