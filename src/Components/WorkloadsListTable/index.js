//Wrapper for API connection
import React from 'react';

/* import { useGetClustersQuery } from '../../Services/SmartProxy'; */
import { WorkloadsListTable } from './WorkloadsListTable';

const WorkloadsListTableWrapper = () => {
  //Will be a workloads query when we connect it to the API
  /* const query = useGetClustersQuery(); */

  return <WorkloadsListTable /* query={query} */ />;
};

export default WorkloadsListTableWrapper;
