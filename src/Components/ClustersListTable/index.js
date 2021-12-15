import React from 'react';
import { useGetClustersQuery } from '../../Services/SmartProxy';
import { ClustersListTable } from './ClustersListTable';

const ClustersListTableWrapper = () => {
  const query = useGetClustersQuery();

  return <ClustersListTable query={query} />;
};

export default ClustersListTableWrapper;
