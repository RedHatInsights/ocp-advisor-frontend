import React from 'react';
import { useGetClustersQuery } from '../../Services/SmartProxy';
import { ClustersListTable } from './ClustersListTable';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const ClustersListTableWrapper = () => {
  const chrome = useChrome();
  const query = useGetClustersQuery({ preview: chrome.isBeta() });

  return <ClustersListTable query={query} />;
};

export default ClustersListTableWrapper;
