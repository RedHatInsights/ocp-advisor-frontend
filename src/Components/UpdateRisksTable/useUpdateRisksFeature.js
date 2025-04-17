import get from 'lodash/get';
import { useParams } from 'react-router-dom';

import { useGetClusterInfoState } from '../../Services/SmartProxy';

const useUpdateRisksFeature = (clusterId) => {
  const id = clusterId || useParams().clusterId;
  const clusterInfo = useGetClusterInfoState({ id }); // doesn't request new data, uses cache
  const isManaged = get(clusterInfo, 'data.managed', true);

  return !isManaged;
};

export default useUpdateRisksFeature;
