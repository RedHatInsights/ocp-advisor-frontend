import React from 'react';
import { useGetWorkloadsQuery } from '../../Services/SmartProxy';
import { WorkloadsListTable } from './WorkloadsListTable';

const WorkloadsListTableWrapper = () => {
  const query = useGetWorkloadsQuery();

  return <WorkloadsListTable query={query} />;
};

export default WorkloadsListTableWrapper;
