import React from 'react';
import { useParams } from 'react-router-dom';

import {
  useGetClusterByIdQuery,
  useGetClusterInfoQuery,
} from '../../Services/SmartProxy';
import { ClusterHeader } from './ClusterHeader';

const ClusterHeaderWrapper = () => {
  const { clusterId } = useParams();
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
