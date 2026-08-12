import { useFlag, useFlagsStatus } from '@unleash/proxy-client-react';

const useFeatureFlag = (flag) => {
  const { flagsReady } = useFlagsStatus();
  const isFlagEnabled = useFlag(flag);
  return flagsReady ? isFlagEnabled : false;
};

export default useFeatureFlag;
