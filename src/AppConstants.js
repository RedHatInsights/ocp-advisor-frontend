import { createIntl, createIntlCache } from 'react-intl';
import intlHelper from '@redhat-cloud-services/frontend-components-translations/intlHelper';

import messages from './Messages';

const cache = createIntlCache();
const locale = navigator.language.slice(0, 2);
const intl = createIntl(
  {
    // eslint-disable-next-line no-console
    onError: console.error,
    locale,
  },
  cache
);
const intlSettings = { locale };

export const LIKELIHOOD_LABEL = {
  1: intlHelper(intl.formatMessage(messages.low), intlSettings),
  2: intlHelper(intl.formatMessage(messages.medium), intlSettings),
  3: intlHelper(intl.formatMessage(messages.high), intlSettings),
  4: intlHelper(intl.formatMessage(messages.critical), intlSettings),
};
export const IMPACT_LABEL = {
  1: intlHelper(intl.formatMessage(messages.low), intlSettings),
  2: intlHelper(intl.formatMessage(messages.medium), intlSettings),
  3: intlHelper(intl.formatMessage(messages.high), intlSettings),
  4: intlHelper(intl.formatMessage(messages.critical), intlSettings),
};
export const TOTAL_RISK_LABEL = {
  1: intlHelper(intl.formatMessage(messages.low), intlSettings),
  2: intlHelper(intl.formatMessage(messages.moderate), intlSettings),
  3: intlHelper(intl.formatMessage(messages.important), intlSettings),
  4: intlHelper(intl.formatMessage(messages.critical), intlSettings),
};
export const RISK_OF_CHANGE_LABEL = {
  1: intlHelper(intl.formatMessage(messages.veryLow), intlSettings),
  2: intlHelper(intl.formatMessage(messages.low), intlSettings),
  3: intlHelper(intl.formatMessage(messages.moderate), intlSettings),
  4: intlHelper(intl.formatMessage(messages.high), intlSettings),
};
export const RULE_CATEGORIES = {
  service_availability: 1,
  security: 2,
  fault_tolerance: 3,
  performance: 4,
  osd_eligible: 5,
};
export const FILTER_CATEGORIES = {
  total_risk: {
    type: 'checkbox',
    title: 'total risk',
    urlParam: 'total_risk',
    values: [
      { label: TOTAL_RISK_LABEL[4], value: '4' },
      { label: TOTAL_RISK_LABEL[3], value: '3' },
      { label: TOTAL_RISK_LABEL[2], value: '2' },
      { label: TOTAL_RISK_LABEL[1], value: '1' },
    ],
  },
  res_risk: {
    type: 'checkbox',
    title: 'risk of change',
    urlParam: 'res_risk',
    values: [
      { label: RISK_OF_CHANGE_LABEL[4], value: '4' },
      { label: RISK_OF_CHANGE_LABEL[3], value: '3' },
      { label: RISK_OF_CHANGE_LABEL[2], value: '2' },
      { label: RISK_OF_CHANGE_LABEL[1], value: '1' },
    ],
  },
  impact: {
    type: 'checkbox',
    title: 'impact',
    urlParam: 'impact',
    values: [
      { label: IMPACT_LABEL[4], value: '4' },
      { label: IMPACT_LABEL[3], value: '3' },
      { label: IMPACT_LABEL[2], value: '2' },
      { label: IMPACT_LABEL[1], value: '1' },
    ],
  },
  likelihood: {
    type: 'checkbox',
    title: 'likelihood',
    urlParam: 'likelihood',
    values: [
      { label: LIKELIHOOD_LABEL[4], value: '4' },
      { label: LIKELIHOOD_LABEL[3], value: '3' },
      { label: LIKELIHOOD_LABEL[2], value: '2' },
      { label: LIKELIHOOD_LABEL[1], value: '1' },
    ],
  },
  rule_status: {
    type: 'radio',
    title: 'status',
    urlParam: 'rule_status',
    values: [
      {
        label: intlHelper(intl.formatMessage(messages.all), intlSettings),
        value: 'all',
      },
      {
        label: intlHelper(intl.formatMessage(messages.enabled), intlSettings),
        value: 'enabled',
      },
      {
        label: intlHelper(intl.formatMessage(messages.disabled), intlSettings),
        value: 'disabled',
      },
    ],
  },
  category: {
    type: 'checkbox',
    title: 'category',
    urlParam: 'category',
    values: [
      {
        label: intlHelper(
          intl.formatMessage(messages.serviceAvailability),
          intlSettings
        ),
        value: `${RULE_CATEGORIES.service_availability}`,
      },
      {
        label: intlHelper(
          intl.formatMessage(messages.performance),
          intlSettings
        ),
        value: `${RULE_CATEGORIES.performance}`,
      },
      {
        label: intlHelper(
          intl.formatMessage(messages.faultTolerance),
          intlSettings
        ),
        value: `${RULE_CATEGORIES.fault_tolerance}`,
      },
      {
        label: intlHelper(intl.formatMessage(messages.security), intlSettings),
        value: `${RULE_CATEGORIES.security}`,
      },
      {
        label: intlHelper(
          intl.formatMessage(messages.osdEligible),
          intlSettings
        ),
        value: `${RULE_CATEGORIES.osd_eligible}`,
      },
    ],
  },
};
