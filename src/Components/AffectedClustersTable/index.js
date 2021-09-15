import React from 'react';
import { useParams } from 'react-router-dom';

import { useGetAffectedClustersQuery } from '../../Services/SmartProxy';
import { AffectedClustersTable } from './AffectedClustersTable';

const RecommendationWrapper = () => {
  const affectedClusters = useGetAffectedClustersQuery(
    useParams().recommendationId
  );

  return <AffectedClustersTable affectedClusters={affectedClusters} />;
};

export default RecommendationWrapper;
