import React, { useEffect } from 'react';
import { Workload } from './Workload';
import { useParams } from 'react-router-dom';
import { useGetWorkloadByIdQuery } from '../../Services/SmartProxy';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const WorkloadWrapper = () => {
  const chrome = useChrome();
  const { namespaceId, clusterId } = useParams();
  const workload = useGetWorkloadByIdQuery({
    namespaceId,
    clusterId,
  });

  useEffect(() => {
    workload.refetch();
  }, [namespaceId, clusterId]);

  useEffect(() => {
    const subnav = `${
      workload?.data?.status === 'ok'
        ? `${workload?.data?.cluster.display_name} | ${workload?.data?.namespace.name} - Workloads`
        : `${clusterId} | ${namespaceId} - Workloads`
    }`;
    chrome.updateDocumentTitle(`${subnav} - Advisor | OpenShift`);
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
