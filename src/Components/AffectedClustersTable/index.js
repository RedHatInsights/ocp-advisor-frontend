import React from 'react';
import { useParams } from 'react-router-dom';

import { useGetAffectedClustersQuery } from '../../Services/SmartProxy';

import { AffectedClustersTable } from './AffectedClustersTable';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const AffectedClustersTableWrapper = () => {
  const chrome = useChrome();

  const query = useGetAffectedClustersQuery({
    ruleId: useParams().recommendationId,
    preview: chrome.isBeta(),
  });

  return <AffectedClustersTable query={query} />;
};

export default AffectedClustersTableWrapper;
