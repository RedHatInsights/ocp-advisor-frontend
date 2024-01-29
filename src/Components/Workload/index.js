import React, { useEffect } from 'react';
import { Workload } from './Workload';
import { useParams } from 'react-router-dom';
// import { useGetWorkloadByIdQuery } from '../../Services/SmartProxy';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import mockdata from '../../../cypress/fixtures/api/insights-results-aggregator/v2/workload/00000001-0001-0001-0001-000000000005-fad82c1f-96db-430f-b3ec-503fb9eeb7bb/info.json';
import mockList from '../../../cypress/fixtures/api/insights-results-aggregator/v2/workload/list.json';

const WorkloadWrapper = () => {
  const chrome = useChrome();
  const { namespaceId, clusterId } = useParams();
  // const workload = useGetWorkloadByIdQuery({
  //   namespaceId,
  //   clusterId,
  // });

  // Temporary hardcoded data RHINENG-7723
  const uuid = `${clusterId}/${namespaceId}`;
  let workload = {
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
    workload = {
      isError: false,
      isFetching: false,
      isUninitialized: false,
      isLoading: false,
      isSuccess: true,
      data: { ...customData },
      refetch: () => null,
    };
  } else {
    workload = {
      isError: true,
      isFetching: false,
      isUninitialized: false,
      isLoading: false,
      isSuccess: false,
      data: { status: 'error' },
      refetch: () => null,
    };
  }

  useEffect(() => {
    workload.refetch();
  }, [namespaceId, clusterId]);

  useEffect(() => {
    const subnav = `${
      workload?.data?.status === 'ok'
        ? `${workload?.data?.cluster.display_name} | ${workload?.data?.namespace.name} - Workloads`
        : `${clusterId} | ${namespaceId} - Workloads`
    }`;
    chrome.updateDocumentTitle(`${subnav} - OCP Advisor | Red Hat Insights`);
  }, [workload, namespaceId, clusterId]);

  return (
    <Workload
      workload={workload}
      namespaceId={namespaceId}
      clusterId={clusterId}
    />
  );
};

export default WorkloadWrapper;
