import React from 'react';
import PropTypes from 'prop-types';

import {
  Grid,
  GridItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { useIntl } from 'react-intl';
import Skeleton from '@redhat-cloud-services/frontend-components/Skeleton';

import messages from '../../Messages';

export const ClusterHeader = ({ clusterId, lastSeen, displayName }) => {
  const intl = useIntl();
  const {
    isUninitialized,
    isLoading,
    isFetching,
    data: clusterName,
  } = displayName;

  return (
    <React.Fragment>
      <Grid md={12} hasGutter>
        <GridItem>
          {isUninitialized || isLoading || isFetching ? (
            <Skeleton size="sm" />
          ) : (
            <Title size="2xl" headingLevel="h1">
              {clusterName || clusterId}
            </Title>
          )}
        </GridItem>
        <GridItem>
          <Stack>
            <StackItem>
              <span>UUID: </span>
              <span>{clusterId || intl.formatMessage(messages.unknown)}</span>
            </StackItem>
            <StackItem>
              <span>{intl.formatMessage(messages.lastSeen)}: </span>
              <span>{lastSeen || intl.formatMessage(messages.unknown)}</span>
            </StackItem>
          </Stack>
        </GridItem>
      </Grid>
    </React.Fragment>
  );
};

ClusterHeader.propTypes = {
  clusterId: PropTypes.string.isRequired,
  displayName: PropTypes.object.isRequired,
  lastSeen: PropTypes.string,
};
