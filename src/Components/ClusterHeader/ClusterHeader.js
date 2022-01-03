import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import { Grid, GridItem } from '@patternfly/react-core/dist/js/layouts/Grid';
import { Stack, StackItem } from '@patternfly/react-core/dist/js/layouts/Stack';
import { Title } from '@patternfly/react-core/dist/js/components/Title';
import Skeleton from '@redhat-cloud-services/frontend-components/Skeleton';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat/DateFormat';

import messages from '../../Messages';
import { OneLineLoader } from '../../Utilities/Loaders';

export const ClusterHeader = ({ clusterId, clusterData, displayName }) => {
  const intl = useIntl();
  const {
    isUninitialized: isUninitializedDisplayName,
    isFetching: isFetchingDisplayName,
    data: clusterName,
  } = displayName;

  // subscribe to the cluster data query
  const {
    isUninitialized: isUninitializedCluster,
    isFetching: isFetchingCluster,
    data: cluster,
  } = clusterData;

  return (
    <Grid id="cluster-header" md={12} hasGutter>
      <GridItem>
        {isUninitializedDisplayName || isFetchingDisplayName ? (
          <Skeleton size="sm" />
        ) : (
          <Title size="2xl" headingLevel="h1" id="cluster-header-title">
            {clusterName || clusterId}
          </Title>
        )}
      </GridItem>
      <GridItem>
        <Stack>
          <StackItem id="cluster-header-uuid">
            <span>UUID: </span>
            <span>{clusterId || intl.formatMessage(messages.unknown)}</span>
          </StackItem>
          <StackItem id="cluster-header-last-seen">
            <span>{intl.formatMessage(messages.lastSeen)}: </span>
            <span>
              {isUninitializedCluster || isFetchingCluster ? (
                <OneLineLoader />
              ) : cluster?.report?.meta?.last_checked_at ? (
                <DateFormat
                  date={cluster?.report?.meta?.last_checked_at}
                  type="exact"
                />
              ) : (
                intl.formatMessage(messages.unknown)
              )}
            </span>
          </StackItem>
        </Stack>
      </GridItem>
    </Grid>
  );
};

ClusterHeader.propTypes = {
  clusterId: PropTypes.string.isRequired,
  displayName: PropTypes.object.isRequired,
  clusterData: PropTypes.object.isRequired,
};
