import React from 'react';
import { useRouteMatch } from 'react-router-dom';

import { useGetClusterByIdQuery } from '../../Services/SmartProxy';
import { ClusterHeader } from './ClusterHeader';

const ClusterHeaderWrapper = () => {
  const match = useRouteMatch();
  const clusterId = match.params.clusterId;
  const clusterData = useGetClusterByIdQuery({
    id: clusterId,
    includeDisabled: false,
  });

  return <ClusterHeader clusterId={clusterId} clusterData={clusterData} />;
};

export default ClusterHeaderWrapper;
