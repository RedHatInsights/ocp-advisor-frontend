import React from 'react';

import {
  Grid,
  GridItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import Skeleton from '@redhat-cloud-services/frontend-components/Skeleton';
import { OneLineLoader } from '../../Utilities/Loaders';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import PropTypes from 'prop-types';

export const WorkloadHeader = ({ workloadData, namespaceId, clusterId }) => {
  const { isUninitialized, isFetching, data: workload } = workloadData;
  return (
    <Grid id="workload-header" md={12} hasGutter>
      <GridItem span={8}>
        <Title
          size="2xl"
          headingLevel="h1"
          id="cluster-header-title"
          ouiaId="cluster-name"
        >
          {isUninitialized || isFetching ? (
            <>
              <Skeleton size="sm" />
              <Skeleton size="sm" />
            </>
          ) : (
            <>
              <p>{workload.cluster.display_name}</p>
              <p>{workload.namespace.name}</p>
            </>
          )}
        </Title>
      </GridItem>
      <GridItem>
        <Stack>
          <StackItem id="workload-header-uuid">
            <span>Cluster UUID:</span> <span>{clusterId}</span>{' '}
            <span>Namespace UUID:</span> <span>{namespaceId}</span>
          </StackItem>
          <StackItem id="workload-header-last-seen">
            <span>Last seen: </span>
            <span>
              {isUninitialized || isFetching ? (
                <OneLineLoader />
              ) : workload?.metadata?.last_checked_at ? (
                <DateFormat
                  date={workload.metadata.last_checked_at}
                  type="exact"
                />
              ) : (
                <>Unknown</>
              )}
            </span>
          </StackItem>
        </Stack>
      </GridItem>
    </Grid>
  );
};

WorkloadHeader.propTypes = {
  clusterId: PropTypes.string.isRequired,
  namespaceId: PropTypes.string.isRequired,
  workloadData: PropTypes.shape({
    isUninitialized: PropTypes.bool.isRequired,
    isFetching: PropTypes.bool.isRequired,
    data: PropTypes.shape({
      namespace: PropTypes.shape({
        uuid: PropTypes.string,
        name: PropTypes.string,
      }),
      cluster: PropTypes.shape({
        uuid: PropTypes.string,
        display_name: PropTypes.string,
      }),
      status: PropTypes.string,
    }),
  }),
};
