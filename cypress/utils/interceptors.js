import singleClusterPageReport from '../fixtures/api/insights-results-aggregator/v2/cluster/dcb95bbf-8673-4f3a-a63c-12d4a530aa6f/reports-disabled-false.json';
import upgradeRisksFixtures from '../fixtures/api/insights-results-aggregator/v1/clusters/41c30565-b4c9-49f2-a4ce-3277ad22b258/upgrade-risks-prediction.json';

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

export const upgradeRisksInterceptors = {
  successful: () =>
    cy.intercept(
      'GET',
      /\/api\/insights-results-aggregator\/v2\/cluster\/.*\/upgrade-risks-prediction/,
      {
        statusCode: 200,
        body: upgradeRisksFixtures,
      }
    ),
  'successful, alerts empty': () => {
    const fixtures = upgradeRisksFixtures;
    fixtures.upgrade_recommendation.upgrade_risks_predictors.alerts = [];
    cy.intercept(
      'GET',
      /\/api\/insights-results-aggregator\/v2\/cluster\/.*\/upgrade-risks-prediction/,
      {
        statusCode: 200,
        body: fixtures,
      }
    );
  },
  'successful, empty': () => {
    const fixtures = upgradeRisksFixtures;
    fixtures.upgrade_recommendation.upgrade_risks_predictors = {
      alerts: [],
      operator_conditions: [],
    };
    cy.intercept(
      'GET',
      /\/api\/insights-results-aggregator\/v2\/cluster\/.*\/upgrade-risks-prediction/,
      {
        statusCode: 200,
        body: fixtures,
      }
    );
  },
  'error, not available': () =>
    cy.intercept(
      'GET',
      /\/api\/insights-results-aggregator\/v2\/cluster\/.*\/upgrade-risks-prediction/,
      {
        statusCode: 503,
      }
    ),
  'error, other': () =>
    cy.intercept(
      'GET',
      /\/api\/insights-results-aggregator\/v2\/cluster\/.*\/upgrade-risks-prediction/,
      {
        statusCode: 500,
      }
    ),
  'long responding': () =>
    cy.intercept(
      'GET',
      /\/api\/insights-results-aggregator\/v2\/cluster\/.*\/upgrade-risks-prediction/,
      {
        delay: 420000,
      }
    ),
};
