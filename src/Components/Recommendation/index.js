import React, { useEffect } from 'react';

import { useParams, useRouteMatch } from 'react-router-dom';

import { Recommendation } from './Recommendation';
import { useGetRuleByIdQuery } from '../../Services/SmartProxy';

const RecommendationWrapper = () => {
  const rule = useGetRuleByIdQuery(useParams().recommendationId);

  useEffect(() => {
    rule.refetch();
  }, [useParams().recommendationId]);

  return <Recommendation rule={rule} match={useRouteMatch()} />;
};

export default RecommendationWrapper;
