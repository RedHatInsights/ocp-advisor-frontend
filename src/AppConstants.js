import { createIntl, createIntlCache } from 'react-intl';
import intlHelper from '@redhat-cloud-services/frontend-components-translations/intlHelper';

import messages from './Messages';
import { cellWidth } from '@patternfly/react-table';

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
  performance: 2,
  fault_tolerance: 3,
  security: 4,
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
  /* Not exposed by API yet
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
  */
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
    ],
  },
  impacting: {
    type: 'checkbox',
    title: 'systems impacted',
    urlParam: 'impacting',
    values: [
      {
        label: intlHelper(intl.formatMessage(messages.oneOrMore), intlSettings),
        text: intlHelper(intl.formatMessage(messages.oneOrMore), intlSettings),
        value: 'true',
      },
      {
        label: intlHelper(intl.formatMessage(messages.none), intlSettings),
        text: intlHelper(intl.formatMessage(messages.none), intlSettings),
        value: 'false',
      },
    ],
  },
};
export const DEFAULT_CLUSTER_RULES_FILTERS = {
  [FILTER_CATEGORIES.rule_status.urlParam]: 'enabled',
};
export const IMPACT_VALUES = {
  'Application Crash': 2,
  'Application Failure': 2,
  'Application Not Connectable': 2,
  'Authentication Bypass': 3,
  'Best Practice': 1,
  'Boot Failure': 3,
  'Cluster Availability': 2,
  'Compatibility Error': 2,
  'Container Creation Failure': 2,
  'Container Inoperation': 3,
  'Data Loss': 4,
  'Data Corruption': 3,
  'Database Performance Loss': 2,
  'Database Inconsistency': 4,
  'Database Availability': 2,
  'Decreased Security': 2,
  'Denial Of Service': 3,
  'Diagnostics Failure': 1,
  'Docker Metadata Inconsistency': 2,
  'Filesystem Corruption': 2,
  Hardening: 1,
  'Hung Task': 3,
  'Inaccessible Storage': 3,
  'Inconsistent Network Interface Name': 2,
  'Information Disclosure': 3,
  'Insecure Encryption': 2,
  'Invalid Configuration': 1,
  'Kernel Panic': 3,
  'Link Down': 3,
  'Long Restart Time': 2,
  'Malware Detected': 3,
  'Man In The Middle': 4,
  'Management Availability': 2,
  'Mount Failure': 3,
  'Network Connection Hang': 3,
  'Network Connectivity Loss': 3,
  'Network Interface Hang': 3,
  'Network Performance Loss': 2,
  'Network Setup Failure': 3,
  'NFS Mount Stuck': 2,
  'Offline Storage': 2,
  'OpenShift Performance Loss': 2,
  'OpenShift Upgrade Failure': 2,
  'OpenStack Performance Loss': 2,
  'Packet Loss': 2,
  'Privilege Escalation': 3,
  'Product Supportability': 2,
  'Remote Code Execution': 4,
  'RHV Upgrade Failure': 3,
  'Service Crash': 2,
  'Service Inoperation': 2,
  Statistics: 1,
  'Storage Excessive Consumption': 2,
  'Storage Performance Loss': 2,
  'Support Unavailable': 1,
  'Suspicious Activity': 2,
  'System Performance Loss': 2,
  'System Stability Loss': 3,
  'Unapplied Configuration': 2,
  'Undercloud Upgrade Failure': 3,
  'Unmount Failure': 2,
  'Unsupported Hardware': 2,
  'Unsupported Packet': 1,
  'Unsupported Functionality': 3,
  'Unsupported Filesystem': 2,
  'VM Clone Failure': 2,
  'VM Crash': 2,
  'VM Migration Failure': 3,
  'VM Performance Loss': 2,
  'VM Start Failure': 3,
  'Kdump Failure': 1,
  'Application Hang': 2,
  'Service Inoperative': 2,
  null: 1,
  'Volume Type Variation': 1,
  'Instance Type Variation': 1,
  'High Cost with Over-provisioned Instance Type Node': 1,
  'Low Density Node': 1,
};
export const TOTAL_RISK_LABEL_LOWER = {
  1: intlHelper(intl.formatMessage(messages.low).toLowerCase(), intlSettings),
  2: intlHelper(
    intl.formatMessage(messages.moderate).toLowerCase(),
    intlSettings
  ),
  3: intlHelper(
    intl.formatMessage(messages.important).toLowerCase(),
    intlSettings
  ),
  4: intlHelper(
    intl.formatMessage(messages.critical).toLowerCase(),
    intlSettings
  ),
};
export const RECS_LIST_COLUMNS = [
  {
    title: intl.formatMessage(messages.name),
    transforms: [cellWidth(40)],
  },
  {
    title: intl.formatMessage(messages.added),
    transforms: [cellWidth(10)],
  },
  {
    title: intl.formatMessage(messages.totalRisk),
    transforms: [cellWidth(15)],
  },
  {
    title: intl.formatMessage(messages.riskOfChange),
    transforms: [cellWidth(15)],
  },
  {
    title: intl.formatMessage(messages.clusters),
    transforms: [cellWidth(20)],
  },
];
