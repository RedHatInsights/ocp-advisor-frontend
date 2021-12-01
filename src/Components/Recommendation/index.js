import React, { useEffect } from 'react';

import { useParams, useRouteMatch } from 'react-router-dom';

import { Recommendation } from './Recommendation';
import { useGetRuleByIdQuery } from '../../Services/SmartProxy';
import { useGetRecAcksQuery } from '../../Services/Acks';

const RecommendationWrapper = () => {
  const rule = useGetRuleByIdQuery(useParams().recommendationId);
  const ack = useGetRecAcksQuery({ ruleId: useParams().recommendationId });

  useEffect(() => {
    rule.refetch();
  }, [useParams().recommendationId]);

  return <Recommendation rule={rule} ack={ack} match={useRouteMatch()} />;
};

export default RecommendationWrapper;
