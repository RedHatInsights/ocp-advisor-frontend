import React from 'react';
import { WorkloadHeader } from './WorkloadHeader';
import { useParams } from 'react-router-dom';
// import { useGetWorkloadByIdQuery } from '../../Services/SmartProxy';
import mockdata from '../../../cypress/fixtures/api/insights-results-aggregator/v2/workload/00000001-0001-0001-0001-000000000005-fad82c1f-96db-430f-b3ec-503fb9eeb7bb/info.json';
import mockList from '../../../cypress/fixtures/api/insights-results-aggregator/v2/workload/list.json';

const WorkloadsHeaderWrapper = () => {
  const { namespaceId, clusterId } = useParams();
  // const workloadData = useGetWorkloadByIdQuery({
  //   namespaceId,
  //   clusterId,
  // });

  const uuid = `${clusterId}/${namespaceId}`;
  let workloadData = {
    isError: false,
    isFetching: true,
    isUninitialized: true,
    isLoading: true,
    isSuccess: false,
    data: {},
    refetch: () => null,
  };

  if (mockList.includes(uuid)) {
    const customData = {
      ...mockdata,
      cluster: {
        display_name: `Cluster name ${clusterId}`,
        uuid: clusterId,
      },
      namespace: {
        name: `Namespace name ${namespaceId}`,
        uuid: namespaceId,
      },
    };
    workloadData = {
      isError: false,
      isFetching: false,
      isUninitialized: false,
      isLoading: false,
      isSuccess: true,
      data: { ...customData },
      refetch: () => null,
    };
  } else {
    workloadData = {
      isError: true,
      isFetching: false,
      isUninitialized: false,
      isLoading: false,
      isSuccess: false,
      data: { status: 'error' },
      refetch: () => null,
    };
  }

  return (
    <WorkloadHeader
      workloadData={workloadData}
      namespaceId={namespaceId}
      clusterId={clusterId}
    />
  );
};

export default WorkloadsHeaderWrapper;
