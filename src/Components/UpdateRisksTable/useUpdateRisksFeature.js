import get from 'lodash/get';
import { useParams } from 'react-router-dom';

import { useUpdateRisksFeatureFlag } from '../../Utilities/useFeatureFlag';
import { useGetClusterInfoState } from '../../Services/SmartProxy';

const useUpdateRisksFeature = (clusterId) => {
  const updateRisksEnabled = useUpdateRisksFeatureFlag();
  const id = clusterId || useParams().clusterId;
  const clusterInfo = useGetClusterInfoState({ id }); // doesn't request new data, uses cache
  const isManaged = get(clusterInfo, 'data.managed', true);

  return updateRisksEnabled && !isManaged;
};

export default useUpdateRisksFeature;
