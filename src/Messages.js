/* eslint-disable max-len */
import { defineMessages } from 'react-intl';

export default defineMessages({
  documentTitle: {
    id: 'documentTitle',
    description: 'The title of the page as it appears in the browser tab',
    defaultMessage: '{subnav} - OCP Advisor | Red Hat Insights',
  },
  clusters: {
    id: 'clusters',
    description:
      'Clusters title used in recommendation table column and clusters tab header',
    defaultMessage: 'Clusters',
  },
  added: {
    id: 'added',
    description: 'Recommendation table column title',
    defaultMessage: 'Added',
  },
  loading: {
    id: 'loading',
    description: 'Loading text',
    defaultMessage: 'Loading',
  },
  lastSeen: {
    id: 'lastSeen',
    description:
      'Used in the cluster table title column, the last time a cluster has checked in',
    defaultMessage: 'Last seen',
  },
  actions: {
    id: 'actions',
    description: 'actions',
    defaultMessage: 'Actions',
  },
  name: {
    id: 'name',
    description:
      'Used in the cluster table title column, identifying display name of a cluster',
    defaultMessage: 'Name',
  },
  filterBy: {
    id: 'filterBy',
    description: 'Filter by name',
    defaultMessage: 'Filter by name',
  },
  totalRisk: {
    id: 'totalRisk',
    description:
      'Recommendation table column title, recommendationdetails label',
    defaultMessage: 'Total risk',
  },
  recommendation: {
    id: 'recommendation',
    description: 'Recommendation',
    defaultMessage: 'Recommendation',
  },
  recommendations: {
    id: 'recommendations',
    description: 'Used as a title',
    defaultMessage: 'Recommendations',
  },
  insightsHeader: {
    id: 'insightsHeader',
    description: 'Header for the application title',
    defaultMessage: 'Advisor',
  },
  unknown: {
    id: 'unknown',
    description: 'Unknown',
    defaultMessage: 'Unknown',
  },
  low: {
    id: 'low',
    description: 'Filter value',
    defaultMessage: 'Low',
  },
  moderate: {
    id: 'moderate',
    description: 'Filter value',
    defaultMessage: 'Moderate',
  },
  important: {
    id: 'important',
    description: 'Filter value',
    defaultMessage: 'Important',
  },
  critical: {
    id: 'critical',
    description: 'Filter value',
    defaultMessage: 'Critical',
  },
  veryLow: {
    id: 'veryLow',
    description: 'Filter value',
    defaultMessage: 'Very Low',
  },
  medium: {
    id: 'medium',
    description: 'Filter value',
    defaultMessage: 'Medium',
  },
  high: {
    id: 'high',
    description: 'Filter value',
    defaultMessage: 'High',
  },
  serviceAvailability: {
    id: 'serviceAvailability',
    description: 'Filter value',
    defaultMessage: 'Service Availability',
  },
  performance: {
    id: 'performance',
    description: 'Filter value',
    defaultMessage: 'Performance',
  },
  faultTolerance: {
    id: 'faultTolerance',
    description: 'Filter value',
    defaultMessage: 'Fault Tolerance',
  },
  security: {
    id: 'security',
    description: 'Filter value',
    defaultMessage: 'Security',
  },
  enabled: {
    id: 'enabled',
    description: 'Filter value',
    defaultMessage: 'Enabled',
  },
  impact: {
    id: 'impact',
    description: 'Filter title',
    defaultMessage: 'Impact',
  },
  impactLevel: {
    id: 'impactLevel',
    description: 'Describes the impact level of a rule',
    defaultMessage: '{level} impact',
  },
  impactDescription: {
    id: 'impactDescription',
    description:
      'Used in the SeverityLine tooltip to describe the impact of a rule',
    defaultMessage:
      'The impact of the problem would be {level} if it occurred.',
  },
  category: {
    id: 'category',
    description: 'Filter title',
    defaultMessage: 'Category',
  },
  likelihood: {
    id: 'likelihood',
    description: 'Filter title',
    defaultMessage: 'Likelihood',
  },
  likelihoodLevel: {
    id: 'likelihoodLevel',
    description: 'Describes the likelihood of a rule',
    defaultMessage: '{level} likelihood',
  },
  likelihoodDescription: {
    id: 'likelihoodDescription',
    description:
      'Used in the SeverityLine tooltip to describe the likelihood of a rule',
    defaultMessage: 'The likelihood that this will be a problem is {level}.',
  },
  all: {
    id: 'all',
    description: 'All',
    defaultMessage: 'All',
  },
  disabled: {
    id: 'disabled',
    description: 'Disabled',
    defaultMessage: 'Disabled',
  },
  resetFilters: {
    id: 'resetFilters',
    description: 'Filter action, reset all filter chips',
    defaultMessage: 'Reset filters',
  },
  noMatchingRecommendations: {
    id: 'noMatchingRecommendations',
    defaultMessage: 'No matching recommendations found',
  },
  noMatchingRecommendationsDesc: {
    id: 'noMatchingRecommendationsDesc',
    defaultMessage:
      'This filter criteria matches no recommendations. Try changing your filter settings.',
  },
  noRecommendations: {
    id: 'noRecommendations',
    description:
      'Recommendation table, no recommendations message for any known rules, body',
    defaultMessage:
      'None of your connected systems are affected by any known recommendations.',
  },
  noRecommendationsDesc: {
    id: 'noRecommendationsDesc',
    defaultMessage: 'No known recommendations affect this cluster.',
  },
});
