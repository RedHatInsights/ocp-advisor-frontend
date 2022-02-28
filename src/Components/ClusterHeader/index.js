import React from 'react';
import { routerParams } from '@redhat-cloud-services/frontend-components-utilities/RouterParams/RouterParams';

import { useGetClusterByIdQuery } from '../../Services/SmartProxy';
import { ClusterHeader } from './ClusterHeader';

export default routerParams(({ match }) => {
  const clusterId = match.params.clusterId;
  const clusterData = useGetClusterByIdQuery({
    id: clusterId,
    includeDisabled: false,
  });

  return <ClusterHeader clusterId={clusterId} clusterData={clusterData} />;
});
