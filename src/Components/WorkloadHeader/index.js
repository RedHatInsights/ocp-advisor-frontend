import React from 'react';
import { WorkloadHeader } from './WorkloadHeader';
import { useParams } from 'react-router-dom';
import { useGetWorkloadByIdQuery } from '../../Services/SmartProxy';

const WorkloadsHeaderWrapper = () => {
  const { namespaceId, clusterId } = useParams();
  const workloadData = useGetWorkloadByIdQuery({
    namespaceId,
    clusterId,
  });

  return (
    <WorkloadHeader
      workloadData={workloadData}
      namespaceId={namespaceId}
      clusterId={clusterId}
    />
  );
};

export default WorkloadsHeaderWrapper;
