import React from 'react';
import { useRouteMatch } from 'react-router-dom';

import {
  useGetClusterByIdQuery,
  useGetClusterInfoQuery,
} from '../../Services/SmartProxy';
import { ClusterHeader } from './ClusterHeader';

const ClusterHeaderWrapper = () => {
  const match = useRouteMatch();
  const clusterId = match.params.clusterId;
  const clusterData = useGetClusterByIdQuery({
    id: clusterId,
    includeDisabled: false,
  });
  const clusterInfo = useGetClusterInfoQuery({
    id: clusterId,
  });

  return (
    <ClusterHeader
      clusterId={clusterId}
      clusterData={clusterData}
      clusterInfo={clusterInfo}
    />
  );
};

export default ClusterHeaderWrapper;
