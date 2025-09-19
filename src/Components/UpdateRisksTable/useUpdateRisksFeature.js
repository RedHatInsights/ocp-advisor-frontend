import get from 'lodash/get';
import { useParams } from 'react-router-dom';

import { useGetClusterInfoState } from '../../Services/SmartProxy';

const useUpdateRisksFeature = (clusterId) => {
  const { clusterId: paramsClusterId } = useParams();
  const id = clusterId || paramsClusterId;
  const clusterInfo = useGetClusterInfoState({ id });
  const isManaged = get(clusterInfo, 'data.managed', true);

  return !isManaged;
};

export default useUpdateRisksFeature;
