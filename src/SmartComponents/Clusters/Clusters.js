import React, { Suspense, lazy } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Loading from '../../PresentationalComponents/Loading/Loading';

const Details = lazy(() =>
  import(
    /* webpackChunkName: "InventoryDetails" */ '../../PresentationalComponents/Clusters/ClusterDetails'
  )
);

const suspenseHelper = (component) => (
  <Suspense fallback={<Loading />}>{component}</Suspense>
);

const Clusters = () => (
  <Switch>
    <Route
      exact
      path="/advisor/clusters/:clusterId"
      component={() => suspenseHelper(<Details />)}
    />
    <Redirect path="*" to="/sample" push />
  </Switch>
);

export default Clusters;
