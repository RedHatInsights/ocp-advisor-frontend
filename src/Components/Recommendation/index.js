import React, { useEffect } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import { useIntl } from 'react-intl';

import { Recommendation } from './Recommendation';
import {
  useGetAffectedClustersQuery,
  useGetRuleByIdQuery,
} from '../../Services/SmartProxy';
import { useGetRecAcksQuery } from '../../Services/Acks';
import messages from '../../Messages';

const RecommendationWrapper = () => {
  const intl = useIntl();
  const rule = useGetRuleByIdQuery(useParams().recommendationId);
  const ack = useGetRecAcksQuery({ ruleId: useParams().recommendationId });
  if (rule.isSuccess && rule.data?.content?.description) {
    const subnav = `${rule.data.content.description} - Recommendations`;
    insights.chrome.updateDocumentTitle(
      intl.formatMessage(messages.documentTitle, { subnav })
    );
  }
  const clusters = useGetAffectedClustersQuery(useParams().recommendationId);

  useEffect(() => {
    rule.refetch();
  }, [useParams().recommendationId]);

  return (
    <Recommendation
      rule={rule}
      ack={ack}
      clusters={clusters}
      match={useRouteMatch()}
    />
  );
};

export default RecommendationWrapper;
