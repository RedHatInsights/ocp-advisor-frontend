import { useFlag, useFlagsStatus } from '@unleash/proxy-client-react';

const useFeatureFlag = (flag) => {
  const { flagsReady } = useFlagsStatus();
  const isFlagEnabled = useFlag(flag);
  return flagsReady ? isFlagEnabled : false;
};

export default useFeatureFlag;

export const UPDATE_RISKS_ENABLE_FLAG =
  'ocp-advisor.upgrade-risks.enable-in-stable';

export const WORKLOADS_ENABLE_FLAG = 'ocp-advisor-ui-workloads';

export const useUpdateRisksFeatureFlag = () => {
  const updateRisksEnabled = useFeatureFlag(UPDATE_RISKS_ENABLE_FLAG);

  return updateRisksEnabled;
};

export const useWorkloadsFeatureFlag = () => {
  const workloadsEnabled = useFeatureFlag(WORKLOADS_ENABLE_FLAG);
  return workloadsEnabled;
};
