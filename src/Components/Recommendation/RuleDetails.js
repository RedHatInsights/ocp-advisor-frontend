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
        // ! TODO better to compile messages locally and send to async component instead of sharing intl?
        intlProps={intl}
        isDetailsPage={isDetailsPage}
        header={header}
        resolutionRisk={resolutionRisk}
        isOpenShift
        riskOfChangeDesc={riskOfChangeDesc}
        onFeedbackChanged={onFeedbackChanged}
      />
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
};

export default RuleDetails;
