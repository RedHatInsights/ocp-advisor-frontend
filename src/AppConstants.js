export const CLUSTER_FETCH = 'CLUSTER_FETCH';

export const BASE_URL = '/api/insights-results-aggregator/v1';
export const CLUSTER_FETCH_URL = (clusterId) =>
  `${BASE_URL}/clusters/${clusterId}/report`;

/* let's uncomment only those that are utilized
export const RULE_FETCH = 'RULE_FETCH';
export const RULES_FETCH = 'RULES_FETCH';
export const RULE_SET = 'RULE_SET';
export const VOTE_ON_RULE = 'VOTE_ON_RULE';
export const DISABLE_RULE = 'DISABLE_RULE';
export const ENABLE_RULE = 'ENABLE_RULE';
export const SEND_FEEDBACK_ON_RULE_DISABLE = 'SEND_FEEDBACK_ON_RULE_DISABLE';
export const RULE_CATEGORIES = 'RULE_CATEGORIES';
export const SET_REPORT_DETAILS = 'SET_REPORT_DETAILS';

export const SEVERITY_MAP = {
  'critical-risk': 4,
  'high-risk': 3,
  'medium-risk': 2,
  'low-risk': 1,
};
*/
