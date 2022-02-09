import React from 'react';
import { routerParams } from '@redhat-cloud-services/frontend-components-utilities/RouterParams/RouterParams';

import {
  useGetClusterByIdQuery,
  useGetDisplayNameQuery,
} from '../../Services/SmartProxy';
import { ClusterHeader } from './ClusterHeader';

export default routerParams(({ match }) => {
  const clusterId = match.params.clusterId;
  const clusterData = useGetClusterByIdQuery({
    id: clusterId,
    includeDisabled: false,
  });
  const displayName = useGetDisplayNameQuery({
    id: match.params.clusterId,
    includeDisabled: false,
  });
  return (
    <ClusterHeader
      clusterId={clusterId}
      displayName={displayName}
      clusterData={clusterData}
    />
  );
});
