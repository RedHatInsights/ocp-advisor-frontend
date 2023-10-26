/* eslint-disable no-unused-vars */
//^ this will be removed later
import React from 'react';
import useFeatureFlag, {
  WORKLOADS_ENABLE_FLAG,
} from '../../Utilities/useFeatureFlag';

const WorkloadsListTable = () => {
  const workloadsEnabled = useFeatureFlag(WORKLOADS_ENABLE_FLAG);
  console.log(workloadsEnabled, 'FLAG');
};

export { WorkloadsListTable };
