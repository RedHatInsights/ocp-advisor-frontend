import React from 'react';
import { WorkloadHeader } from './WorkloadHeader';
import PropTypes from 'prop-types';

const WorkloadsHeaderWrapper = ({ workload, namespaceId, clusterId }) => {
  return (
    <WorkloadHeader
      workloadData={workload}
      namespaceId={namespaceId}
      clusterId={clusterId}
    />
  );
};
WorkloadsHeaderWrapper.propTypes = {
  clusterId: PropTypes.string.isRequired,
  namespaceId: PropTypes.string.isRequired,
  workload: PropTypes.shape({
    isUninitialized: PropTypes.bool.isRequired,
    isFetching: PropTypes.bool.isRequired,
    data: PropTypes.shape({
      metadata: PropTypes.shape({
        last_checked_at: PropTypes.string,
      }),
      namespace: PropTypes.shape({
        uuid: PropTypes.string,
        name: PropTypes.string,
      }),
      cluster: PropTypes.shape({
        uuid: PropTypes.string,
        display_name: PropTypes.string,
      }),
      status: PropTypes.string,
    }),
  }),
};

export default WorkloadsHeaderWrapper;
