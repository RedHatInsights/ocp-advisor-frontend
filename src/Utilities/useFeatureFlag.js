import { useFlag, useFlagsStatus } from '@unleash/proxy-client-react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const useFeatureFlag = (flag) => {
  const { flagsReady } = useFlagsStatus();
  const isFlagEnabled = useFlag(flag);
  return flagsReady ? isFlagEnabled : false;
};

export default useFeatureFlag;

export const UPDATE_RISKS_ENABLE_FLAG =
  'ocp-advisor.upgrade-risks.enable-in-stable';

// Second feature flag for Update Risk Label in Clusters page
export const UPDATE_RISKS_UI_ENABLE_FLAG = 'ocp-advisor-ui-upgrade-risks';

export const WORKLOADS_ENABLE_FLAG = 'ocp-advisor-ui-workloads';

export const useUpdateRisksFeatureFlag = () => {
  const updateRisksEnabled = useFeatureFlag(UPDATE_RISKS_ENABLE_FLAG);
  const chrome = useChrome();

  return chrome.isBeta() || updateRisksEnabled;
};

export const useUpdateRisksUIFeatureFlag = () => {
  const updateRisksUIEnabled = useFeatureFlag(UPDATE_RISKS_UI_ENABLE_FLAG);

  return updateRisksUIEnabled;
};

export const useWorkloadsFeatureFlag = () => {
  const workloadsEnabled = useFeatureFlag(WORKLOADS_ENABLE_FLAG);
  return workloadsEnabled;
};
