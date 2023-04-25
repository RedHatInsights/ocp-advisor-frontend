import get from 'lodash/get';
import { useParams } from 'react-router-dom';

import { useUpgradeRisksFeatureFlag } from '../../Utilities/useFeatureFlag';
import { useGetClusterInfoState } from '../../Services/SmartProxy';

const useUpgradeRisksFeature = (clusterId) => {
  const upgradeRisksEnabled = useUpgradeRisksFeatureFlag();
  const id = clusterId || useParams().clusterId;
  const clusterInfo = useGetClusterInfoState({ id }); // doesn't request new data, uses cache
  const isManaged = get(clusterInfo, 'data.managed', true);

  return upgradeRisksEnabled && !isManaged;
};

export default useUpgradeRisksFeature;
