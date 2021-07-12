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
    defaultMessage: 'Loading...',
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
});
