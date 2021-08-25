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
        riskOfChangeDesc={riskOfChangeDesc}
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
};

export default RuleDetails;
