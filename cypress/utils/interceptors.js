import singleClusterPageReport from '../fixtures/api/insights-results-aggregator/v2/cluster/dcb95bbf-8673-4f3a-a63c-12d4a530aa6f/reports-disabled-false.json';
import updateRisksFixtures from '../fixtures/api/insights-results-aggregator/v2/cluster/dcb95bbf-8673-4f3a-a63c-12d4a530aa6f/upgrade-risks-prediction.json';
import clusterInfoFixtures from '../fixtures/api/insights-results-aggregator/v2/cluster/dcb95bbf-8673-4f3a-a63c-12d4a530aa6f/info.json';
import clustersUpdateRisks from '../fixtures/api/insights-results-aggregator/v2/upgrade-risks-prediction.json';
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

export const featureFlagsInterceptors = {
  successful: () => {
    cy.intercept('GET', '/feature_flags*', {
      statusCode: 200,
      body: {
        toggles: [],
      },
    }).as('getFeatureFlag');
  },
};

export const clustersUpdateRisksInterceptors = {
  successful: () => {
    cy.intercept(
      'POST',
      /\/api\/insights-results-aggregator\/v2\/upgrade-risks-prediction/,
      (req) => {
        const fixtureWithOneUpdateRisk = req?.body?.clusters.map(
          (item, index) => {
            return index === 0
              ? {
                  ...clustersUpdateRisks.predictions[0],
                  cluster_id: item,
                }
              : {
                  ...clustersUpdateRisks.predictions[1],
                  cluster_id: item,
                };
          }
        );
        req.continue((res) => {
          res.send({
            statusCode: 200,
            body: { predictions: fixtureWithOneUpdateRisk, status: 'ok' },
          });
        });
      }
    ).as('clustersUpdateRisksOKOne');
  },
  'successful, two labels': () => {
    cy.intercept(
      'POST',
      /\/api\/insights-results-aggregator\/v2\/upgrade-risks-prediction/,
      (req) => {
        const fixtureWithTwoUpdateRisks = req?.body?.clusters.map(
          (item, index) => {
            return index === 0 || index === 3
              ? {
                  ...clustersUpdateRisks.predictions[0],
                  cluster_id: item,
                }
              : {
                  ...clustersUpdateRisks.predictions[1],
                  cluster_id: item,
                };
          }
        );
        req.continue((res) => {
          res.send({
            statusCode: 200,
            body: { predictions: fixtureWithTwoUpdateRisks, status: 'ok' },
          });
        });
      }
    ).as('clustersUpdateRisksOKTwo');
  },
  'successful, no labels': () => {
    cy.intercept(
      'POST',
      /\/api\/insights-results-aggregator\/v2\/upgrade-risks-prediction/,
      (req) => {
        const fixtureWithOneUpdateRisk = req?.body?.clusters.map((item) => ({
          ...clustersUpdateRisks.predictions[1],
          cluster_id: item,
        }));
        req.continue((res) => {
          res.send({
            statusCode: 200,
            body: { predictions: fixtureWithOneUpdateRisk, status: 'ok' },
          });
        });
      }
    ).as('clustersUpdateRisksOKNoLabels');
  },
  'error, status not ok': () =>
    cy
      .intercept(
        'POST',
        /\/api\/insights-results-aggregator\/v2\/upgrade-risks-prediction/,
        {
          statusCode: 200,
          body: {
            status: 'not ok',
          },
        }
      )
      .as('clustersUpdateRisksNotOk'),
  'error, not found': () =>
    cy
      .intercept(
        'POST',
        /\/api\/insights-results-aggregator\/v2\/upgrade-risks-prediction/,
        {
          statusCode: 404,
        }
      )
      .as('clustersUpdateRisks404'),
  'error, other': () =>
    cy
      .intercept(
        'POST',
        /\/api\/insights-results-aggregator\/v2\/upgrade-risks-prediction/,
        {
          statusCode: 500,
        }
      )
      .as('clustersUpdateRisks500'),
  'long responding': () =>
    cy
      .intercept(
        'POST',
        /\/api\/insights-results-aggregator\/v2\/upgrade-risks-prediction/,
        {
          delay: 4200,
        }
      )
      .as('clustersUpdateRisksLong'),
};
