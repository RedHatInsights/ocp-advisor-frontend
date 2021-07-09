import React from 'react';
import PropTypes from 'prop-types';

import { Grid, GridItem } from '@patternfly/react-core';
import Skeleton from '@redhat-cloud-services/frontend-components/Skeleton';

const ClusterDetailHead = ({ cluster, clusterFetchStatus }) => (
  <React.Fragment>
    <Grid md={6}>
      <GridItem>
        <div>
          <span>UUID</span>
          <span>
            {clusterFetchStatus !== 'fulfilled' ? (
              <Skeleton size="md" />
            ) : (
              cluster.cluster_id && 'Unknown'
            )}
          </span>
        </div>
      </GridItem>
      <GridItem>
        <div>
          <span>Last seen:</span>
          <span>
            {clusterFetchStatus !== 'fulfilled' ? (
              <Skeleton size="md" />
            ) : (
              cluster.last_seen && 'Unknown'
            )}{' '}
          </span>
        </div>{' '}
      </GridItem>
    </Grid>
  </React.Fragment>
);

ClusterDetailHead.propTypes = {
  cluster: PropTypes.object.isRequired,
  clusterFetchStatus: PropTypes.string.isRequired,
};

export default ClusterDetailHead;
