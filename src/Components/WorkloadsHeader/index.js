import React from 'react';
//TODO: Replace commented parts with the workloads when we connect it to API
/* import {
  useGetClusterByIdQuery,
  useGetClusterInfoQuery,
} from '../../Services/SmartProxy'; */
import { WorkloadsHeader } from './WorkloadsHeader';

const WorkloadsHeaderWrapper = () => {
  /* const { clusterId } = useParams(); */
  /*   const clusterData = useGetClusterByIdQuery({
    id: clusterId,
    includeDisabled: false,
  });
  const clusterInfo = useGetClusterInfoQuery({
    id: clusterId,
  });
*/
  return <WorkloadsHeader />;
};

export default WorkloadsHeaderWrapper;
