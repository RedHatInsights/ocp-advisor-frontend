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
  const chrome = useChrome();
  const rule = useGetRuleByIdQuery({
    ruleId: recommendationId,
    preview: chrome.isBeta(),
  });
  const ack = useGetRecAcksQuery({
    ruleId: recommendationId,
  });

  if (rule.isSuccess && rule.data?.content?.description) {
    const subnav = `${rule.data.content.description} - Recommendations`;
    chrome.updateDocumentTitle(
      intl.formatMessage(messages.documentTitle, { subnav })
    );
  }
  const clusters = useGetAffectedClustersQuery({
    ruleId: recommendationId,
    preview: chrome.isBeta(),
  });

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
