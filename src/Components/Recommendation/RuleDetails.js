import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';

import Loading from '../Loading/Loading';

const RuleDetails = ({
  rule,
  header,
  isDetailsPage,
  resolutionRisk,
  riskOfChangeDesc,
  onFeedbackChanged,
  children,
}) => {
  const intl = useIntl();

  return (
    <div className="advisor">
      <AsyncComponent
        appName="advisor"
        module="./AdvisorRecommendationDetails"
        fallback={<Loading />}
        rule={rule}
        customItnl
        intlProps={intl}
        isDetailsPage={isDetailsPage}
        header={header}
        resolutionRisk={resolutionRisk}
        isOpenShift
        riskOfChangeDesc={riskOfChangeDesc}
        onFeedbackChanged={onFeedbackChanged}
      >
        {children}
      </AsyncComponent>
    </div>
  );
};

RuleDetails.propTypes = {
  header: PropTypes.any,
  isDetailsPage: PropTypes.bool.isRequired,
  rule: PropTypes.object.isRequired,
  resolutionRisk: PropTypes.number,
  riskOfChangeDesc: PropTypes.string,
  onFeedbackChanged: PropTypes.func,
  children: PropTypes.node,
};

export default RuleDetails;
