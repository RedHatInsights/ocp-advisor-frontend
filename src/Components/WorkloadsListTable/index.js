import React from 'react';
import { useGetWorkloadsQuery } from '../../Services/SmartProxy';
import { WorkloadsListTable } from './WorkloadsListTable';
// import mockdata from '../../../cypress/fixtures/api/insights-results-aggregator/v2/workloads.json';

const WorkloadsListTableWrapper = () => {
  const query = useGetWorkloadsQuery();

  // For more diverse use mockdata
  // Comment out the query above
  // Uncomment the query below
  // Uncomment the mockdata import above
  // const query = {
  //   isError: false,
  //   isFetching: false,
  //   isUninitialized: false,
  //   isSuccess: true,
  //   data: { workloads: mockdata },
  //   refetch: () => null,
  // };

  return <WorkloadsListTable query={query} />;
};

export default WorkloadsListTableWrapper;
