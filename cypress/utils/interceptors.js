import singleClusterPageReport from '../fixtures/api/insights-results-aggregator/v2/cluster/dcb95bbf-8673-4f3a-a63c-12d4a530aa6f/reports-disabled-false.json';
import updateRisksFixtures from '../fixtures/api/insights-results-aggregator/v1/clusters/41c30565-b4c9-49f2-a4ce-3277ad22b258/upgrade-risks-prediction.json';
import clusterInfoFixtures from '../fixtures/api/insights-results-aggregator/v2/cluster/dcb95bbf-8673-4f3a-a63c-12d4a530aa6f/info.json';
import _ from 'lodash';

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
    const report = _.cloneDeep(singleClusterPageReport);
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
    const report = _.cloneDeep(singleClusterPageReport);
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

export const updateRisksInterceptors = {
  successful: () =>
    cy.intercept(
      'GET',
      /\/api\/insights-results-aggregator\/v2\/cluster\/.*\/upgrade-risks-prediction/,
      {
        statusCode: 200,
        body: updateRisksFixtures,
      }
    ),
  'successful, alerts empty': () => {
    const fixtures = _.cloneDeep(updateRisksFixtures);
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
    const fixtures = _.cloneDeep(updateRisksFixtures);
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
  'error, not found': () =>
    cy.intercept(
      'GET',
      /\/api\/insights-results-aggregator\/v2\/cluster\/.*\/upgrade-risks-prediction/,
      {
        statusCode: 404,
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

export const clusterInfoInterceptors = {
  successful: () =>
    cy
      .intercept(
        'GET',
        /\/api\/insights-results-aggregator\/v2\/cluster\/.*\/info/,
        {
          statusCode: 200,
          body: clusterInfoFixtures,
        }
      )
      .as('clusterInfo'),
  'successful, managed': () => {
    const fixtures = _.cloneDeep(clusterInfoFixtures);
    fixtures.cluster.managed = true;

    return cy
      .intercept(
        'GET',
        /\/api\/insights-results-aggregator\/v2\/cluster\/.*\/info/,
        {
          statusCode: 200,
          body: fixtures,
        }
      )
      .as('clusterInfo');
  },
};
