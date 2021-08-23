import React from 'react';
import PropTypes from 'prop-types';

import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';

import Loading from '../Loading/Loading';
import { IntlProvider } from 'react-intl';

const RuleDetails = ({
  rule,
  intl,
  header,
  isDetailsPage,
  resolutionRisk,
  riskOfChangeDesc,
}) => {
  return (
    <div className="advisor">
      <IntlProvider locale="en">
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
      </IntlProvider>
    </div>
  );
};

RuleDetails.propTypes = {
  header: PropTypes.any,
  isDetailsPage: PropTypes.bool.isRequired,
  intl: PropTypes.object.isRequired,
  rule: PropTypes.object.isRequired,
  resolutionRisk: PropTypes.number,
  riskOfChangeDesc: PropTypes.string,
};

export default RuleDetails;
