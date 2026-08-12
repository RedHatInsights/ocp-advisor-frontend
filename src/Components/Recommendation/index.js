import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { Recommendation } from './Recommendation';
import {
  useGetAffectedClustersQuery,
  useGetRuleByIdQuery,
} from '../../Services/SmartProxy';
import { useGetRecAcksQuery } from '../../Services/Acks';
import messages from '../../Messages';

const RecommendationWrapper = () => {
  const intl = useIntl();
  const { recommendationId } = useParams();
  const rule = useGetRuleByIdQuery(recommendationId);
  const ack = useGetRecAcksQuery({ ruleId: recommendationId });
  const chrome = useChrome();

  if (rule.isSuccess && rule.data?.content?.description) {
    const subnav = `${rule.data.content.description} - Recommendations`;
    chrome.updateDocumentTitle(
      intl.formatMessage(messages.documentTitle, { subnav }),
    );
  }
  const clusters = useGetAffectedClustersQuery(recommendationId);

  useEffect(() => {
    rule.refetch();
  }, [recommendationId]);

  return (
    <Recommendation
      rule={rule}
      ack={ack}
      clusters={clusters}
      recId={recommendationId}
    />
  );
};

export default RecommendationWrapper;
