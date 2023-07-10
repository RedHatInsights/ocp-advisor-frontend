import React from 'react';
import { useParams } from 'react-router-dom';

import { useGetAffectedClustersQuery } from '../../Services/SmartProxy';

import { AffectedClustersTable } from './AffectedClustersTable';

const AffectedClustersTableWrapper = () => {
  const query = useGetAffectedClustersQuery({
    ruleId: useParams().recommendationId,
  });

  return <AffectedClustersTable query={query} />;
};

export default AffectedClustersTableWrapper;
