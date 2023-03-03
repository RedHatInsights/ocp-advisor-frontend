import { Route, Routes, Navigate } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';

import {
  Bullseye,
  EmptyStateBody,
  Spinner,
  EmptyState,
} from '@patternfly/react-core';
import InvalidObject from '@redhat-cloud-services/frontend-components/InvalidObject/InvalidObject';

const Cluster = lazy(() =>
  import(/* webpackChunkName: "ClusterDetails" */ './Components/Cluster')
);

const Recommendation = lazy(() =>
  import(/* webpackChunkName: "Recommendation" */ './Components/Recommendation')
);

const RecsList = lazy(() =>
  import(/* webpackChunkName: "RecsList" */ './Components/RecsList')
);

const ClustersList = lazy(() =>
  import(/* webpackChunkName: "ClustersList" */ './Components/ClustersList')
);

export const BASE_PATH = '/openshift/insights/advisor';

export const AppRoutes = () => (
  <Suspense
    fallback={
      <Bullseye>
        <Spinner />
      </Bullseye>
    }
  >
    <Routes>
      <Route path="/clusters/:clusterId" element={<Cluster />} />
      <Route path="/clusters" element={<ClustersList />} />
      <Route
        path="/recommendations/:recommendationId"
        element={<Recommendation />}
      />
      <Route path="/recommendations" element={<RecsList />} />
      <Route
        path="/"
        element={<Navigate to={`${BASE_PATH}/recommendations`} replace />}
      />
      <Route
        path="*"
        element={
          <EmptyState>
            <EmptyStateBody>
              <InvalidObject />
            </EmptyStateBody>
          </EmptyState>
        }
      />
    </Routes>
  </Suspense>
);
