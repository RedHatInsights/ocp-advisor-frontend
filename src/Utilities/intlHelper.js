import React from 'react';
import PropTypes from 'prop-types';

import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import messages from '../Messages';
import {
  IMPACT_LABEL,
  IMPACT_LABEL_LOWER,
  LIKELIHOOD_LABEL,
  LIKELIHOOD_LABEL_LOWER,
  RISK_OF_CHANGE_LABEL,
  TOTAL_RISK_LABEL_LOWER,
} from '../AppConstants';
import { strong } from './Helpers';

export const translations = {
  en: require('../../compiled-lang/en.json'),
};

export const Intl = ({ children }) => (
  <IntlProvider
    locale={navigator.language.slice(0, 2)}
    defaultLocale="en"
    messages={translations[navigator.language.slice(0, 2)]}
    onError={console.error}
  >
    {children}
  </IntlProvider>
);

Intl.propTypes = {
  children: PropTypes.element,
};

// takes `messageIds` list and formats the messages using `values`
export const formatMessages = (intl, messageIds, values) =>
  Object.fromEntries(
    messageIds.map((id) => [
      id,
      messages[id] ? intl.formatMessage(messages[id], values[id]) : '',
    ]),
  );

export const mapContentToValues = (intl, rule) => ({
  viewAffectedClusters: {
    clusters: rule.impacted_clusters_count,
  },
  impactLevel: { level: IMPACT_LABEL[rule.impact?.impact] },
  impactDescription: {
    level: IMPACT_LABEL_LOWER[rule.impact?.impact],
  },
  rulesDetailsTotalRiskBody: {
    risk:
      TOTAL_RISK_LABEL_LOWER[rule.total_risk] ||
      intl.formatMessage(messages.undefined),
    strong,
  },
  likelihoodLevel: {
    level: LIKELIHOOD_LABEL[rule.likelihood],
  },
  likelihoodDescription: {
    level: LIKELIHOOD_LABEL_LOWER[rule.likelihood],
  },
  riskOfChangeLabel: {
    level: RISK_OF_CHANGE_LABEL[rule.resolution_risk],
  },
});
