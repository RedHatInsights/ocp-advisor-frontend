import singleClusterPageReport from '../fixtures/api/insights-results-aggregator/v2/cluster/dcb95bbf-8673-4f3a-a63c-12d4a530aa6f/reports-disabled-false.json';

// interceptors
export const clusterReportsInterceptors = {
  successful: () =>
    cy.intercept(
      '/api/insights-results-aggregator/v2/cluster/123/reports?get_disabled=false',
      {
        statusCode: 200,
        body: singleClusterPageReport,
      }
    ),
  'long responding': () =>
    cy.intercept(
      '/api/insights-results-aggregator/v2/cluster/123/reports?get_disabled=false',
      {
        statusCode: 200,
        body: singleClusterPageReport,
        delay: 420000,
      }
    ),
  'server error': () =>
    cy.intercept(
      '/api/insights-results-aggregator/v2/cluster/123/reports?get_disabled=false',
      {
        statusCode: 500,
      }
    ),
  'successful, cluster name is null': () => {
    const report = singleClusterPageReport;
    report.report.meta.cluster_name = '';

    cy.intercept(
      '/api/insights-results-aggregator/v2/cluster/123/reports?get_disabled=false',
      {
        statusCode: 200,
        body: report,
      }
    );
  },
  'successful, no rules': () => {
    const report = singleClusterPageReport;
    report.report.data = [];

    cy.intercept(
      '/api/insights-results-aggregator/v2/cluster/123/reports?get_disabled=false',
      {
        statusCode: 200,
        body: report,
      }
    );
  },
  'successful, not connected': () =>
    cy.intercept(
      '/api/insights-results-aggregator/v2/cluster/123/reports?get_disabled=false',
      {
        statusCode: 404,
      }
    ),
};
