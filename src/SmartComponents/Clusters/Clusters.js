import React, { Suspense, lazy } from 'react';
import { Route, Switch } from 'react-router-dom';

import Loading from '../../PresentationalComponents/Loading/Loading';
import SamplePage from '../../Routes/SamplePage/SamplePage';

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
    <Route>
      <SamplePage />
    </Route>
  </Switch>
);

export default Clusters;
