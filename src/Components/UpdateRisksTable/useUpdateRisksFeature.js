import get from 'lodash/get';
import { useParams } from 'react-router-dom';

import { useUpdateRisksFeatureFlag } from '../../Utilities/useFeatureFlag';
import { useGetClusterInfoState } from '../../Services/SmartProxy';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const useUpdateRisksFeature = (clusterId) => {
  const updateRisksEnabled = useUpdateRisksFeatureFlag();
  const id = clusterId || useParams().clusterId;
  const chrome = useChrome();
  const clusterInfo = useGetClusterInfoState({
    clusterId: id,
    preview: chrome.isBeta(),
  }); // doesn't request new data, uses cache
  const isManaged = get(clusterInfo, 'data.managed', true);

  return updateRisksEnabled && !isManaged;
};

export default useUpdateRisksFeature;
