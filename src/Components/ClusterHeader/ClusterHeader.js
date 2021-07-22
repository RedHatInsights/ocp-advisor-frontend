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
import { useGetClusterDisplayNameByIdQuery } from '../../Services/AccountManagementService';

const ClusterHeader = ({ uuid, lastSeen }) => {
  const intl = useIntl();
  const {
    data: displayName,
    isUninitialized,
    isLoading,
    isFetching,
  } = useGetClusterDisplayNameByIdQuery(uuid);

  return (
    <React.Fragment>
      <Grid md={12} hasGutter>
        <GridItem>
          {isUninitialized || isLoading || isFetching ? (
            <Skeleton size="sm" />
          ) : (
            <Title size="2xl" headingLevel="h1">
              {displayName || uuid}
            </Title>
          )}
        </GridItem>
        <GridItem>
          <Stack>
            <StackItem>
              <span>UUID: </span>
              <span>{uuid || intl.formatMessage(messages.unknown)}</span>
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
  uuid: PropTypes.string.isRequired,
  lastSeen: PropTypes.string,
};

export default ClusterHeader;
