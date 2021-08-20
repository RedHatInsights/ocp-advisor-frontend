import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';

import routerParams from '@redhat-cloud-services/frontend-components-utilities/RouterParams';

import { Recommendation } from './Recommendation';
import { useGetRuleByIdQuery } from '../../Services/SmartProxy';

const RecommendationWrapper = routerParams(({ match }) => {
  const intl = useIntl();
  const rule = useGetRuleByIdQuery(match.params.recommendationId);

  useEffect(() => {
    rule.refetch();
  }, [match.params.recommendationId]);

  return <Recommendation rule={rule} intl={intl} />;
});

export default RecommendationWrapper;
