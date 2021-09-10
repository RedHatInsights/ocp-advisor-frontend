import React from 'react';
import { useParams } from 'react-router-dom';

import { useGetAffectedClustersMockedQuery } from '../../Services/SmartProxyMocked';
import { AffectedClustersTable } from './AffectedClustersTable';

const RecommendationWrapper = () => {
  const affectedClusters = useGetAffectedClustersMockedQuery(
    useParams().recommendationId
  );

  return <AffectedClustersTable affectedClusters={affectedClusters} />;
};

export default RecommendationWrapper;
