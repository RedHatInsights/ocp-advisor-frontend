import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';

import Loading from '../Loading/Loading';
import messages from '../../Messages';
import { translations } from '../../Utilities/intlHelper';

const RuleDetails = ({ children, ...props }) => {
  // make sure history@4.x.x is used as a react-router-dom dependency
  const history = useHistory();

  return (
    <div className="advisor">
      <AsyncComponent
        appName="advisor"
        module="./AdvisorRecommendationDetails"
        fallback={<Loading />}
        isOpenShift
        intlProps={{ messages: translations[navigator.language.slice(0, 2)] }}
        history={history}
        messageDescriptors={messages}
        {...props}
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
