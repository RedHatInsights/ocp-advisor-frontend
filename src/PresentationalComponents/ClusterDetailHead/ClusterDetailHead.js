import React from 'react';
import PropTypes from 'prop-types';

import { Grid, GridItem } from '@patternfly/react-core';
import Skeleton from '@redhat-cloud-services/frontend-components/Skeleton';
import { useIntl } from 'react-intl';
import messages from '../../Messages';

const ClusterDetailHead = ({ cluster, clusterFetchStatus }) => {
  const intl = useIntl();

  return (
    <React.Fragment>
      <Grid md={6}>
        <GridItem>
          <span>UUID</span>
          <span>
            {clusterFetchStatus !== 'fulfilled' ? (
              <Skeleton size="md" />
            ) : (
              cluster.cluster_id && intl.formatMessage(messages.unknown)
            )}
          </span>
        </GridItem>
        <GridItem>
          <span>{intl.formatMessage(messages.lastSeen)}:</span>
          <span>
            {clusterFetchStatus !== 'fulfilled' ? (
              <Skeleton size="md" />
            ) : (
              cluster.last_seen && intl.formatMessage(messages.unknown)
            )}
          </span>
        </GridItem>
      </Grid>
    </React.Fragment>
  );
};

ClusterDetailHead.propTypes = {
  cluster: PropTypes.object.isRequired,
  clusterFetchStatus: PropTypes.string.isRequired,
};

export default ClusterDetailHead;
