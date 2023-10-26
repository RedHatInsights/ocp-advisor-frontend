import { Route, Routes, Navigate } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';

import {
  Bullseye,
  EmptyStateBody,
  Spinner,
  EmptyState,
} from '@patternfly/react-core';
import InvalidObject from '@redhat-cloud-services/frontend-components/InvalidObject/InvalidObject';
import { useWorkloadsFeatureFlag } from './Utilities/useFeatureFlag';

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

const WorkloadsList = lazy(() =>
  import(/* webpackChunkName: "WorkloadsList" */ './Components/WorkloadsList')
);

const Workload = lazy(() =>
  import(/* webpackChunkName: "Workload" */ './Components/Workload')
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
      <Route
        path="/clusters/:clusterId"
        element={
          <Cluster
            /**
             * Generate random `key` to force component re-render,
             * temporary workaround for https://issues.redhat.com/browse/OCPADVISOR-59
             */ key={Math.random()}
          />
        }
      />
      <Route
        path="/clusters"
        element={
          <ClustersList
            /**
             * Generate random `key` to force component re-render,
             * temporary workaround for https://issues.redhat.com/browse/OCPADVISOR-59
             */ key={Math.random()}
          />
        }
      />
      <Route
        path="/recommendations/:recommendationId"
        element={
          <Recommendation
            /**
             * Generate random `key` to force component re-render,
             * temporary workaround for https://issues.redhat.com/browse/OCPADVISOR-59
             */ key={Math.random()}
          />
        }
      />
      <Route
        path="/recommendations"
        element={
          <RecsList
            /**
             * Generate random `key` to force component re-render,
             * temporary workaround for https://issues.redhat.com/browse/OCPADVISOR-59
             */ key={Math.random()}
          />
        }
      />
      {useWorkloadsFeatureFlag && (
        <Route
          path="/workloads"
          element={
            <WorkloadsList
              /**
               * Generate random `key` to force component re-render,
               * temporary workaround for https://issues.redhat.com/browse/OCPADVISOR-59
               */ key={Math.random()}
            />
          }
        />
      )}
      {useWorkloadsFeatureFlag && (
        <Route
          path="/workloads/:workloadId"
          element={
            <Workload
              /**
               * Generate random `key` to force component re-render,
               * temporary workaround for https://issues.redhat.com/browse/OCPADVISOR-59
               */ key={Math.random()}
            />
          }
        />
      )}
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
