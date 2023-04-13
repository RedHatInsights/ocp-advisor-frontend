import React from 'react';
import Cluster from '.';
import singleClusterPageReport from '../../../cypress/fixtures/api/insights-results-aggregator/v2/cluster/dcb95bbf-8673-4f3a-a63c-12d4a530aa6f/reports-disabled-false.json';
import {
  checkNoMatchingRecs,
  checkRowCounts,
} from '../../../cypress/utils/table';
import { clusterReportsInterceptors as interceptors } from '../../../cypress/utils/interceptors';

// selectors
const CLUSTER_HEADER = '#cluster-header';
const BREADCRUMBS = 'nav[class=pf-c-breadcrumb]';
const RULES_TABLE = '#cluster-recs-list-table';
const FILTER_CHIPS = 'li[class=pf-c-chip-group__list-item]';

const CLUSTER_ID = '123';
const CLUSTER_NAME = 'Cluster With Issues';

const mount = (initialEntries = ['/clusters/123']) => {
  cy.mountWithContext(<Cluster />, {
    path: '/clusters/:clusterId',
    routerProps: { initialEntries },
  });
};

describe('cluster page', () => {
  describe('in the successful state', () => {
    beforeEach(() => {
      interceptors.successful();
    });

    it('renders main components', () => {
      mount();

      // renders breadcrumbs
      cy.get(BREADCRUMBS)
        .should('have.length', 1)
        .get('.pf-c-breadcrumb__list > :nth-child(2)')
        .should('have.text', CLUSTER_NAME);
      // renders cluster header
      cy.get(CLUSTER_HEADER).should('have.length', 1);
      // renders table component
      cy.get(RULES_TABLE).should('have.length', 1);
      // test how many rows were rendered
      checkRowCounts(singleClusterPageReport.report.data.length, true);
    });

    it('adds additional filters passed by the query parameters, 1', () => {
      mount(['/clusters/123?total_risk=1&text=foo+bar&category=2']);

      cy.get(BREADCRUMBS).should('have.length', 1);
      cy.get(CLUSTER_HEADER).should('have.length', 1);
      cy.get(RULES_TABLE);
      cy.get(FILTER_CHIPS).each(($el) =>
        expect($el.text()).to.be.oneOf(['foo bar', 'Low', 'Performance'])
      );
      checkNoMatchingRecs();
    });

    it('adds additional filters passed by the query parameters, 2', () => {
      mount(['/clusters/123?total_risk=2&text=foo&category=1']);

      cy.get(BREADCRUMBS).should('have.length', 1);
      cy.get(CLUSTER_HEADER).should('have.length', 1);
      cy.get(RULES_TABLE);
      cy.get(FILTER_CHIPS).each(($el) =>
        expect($el.text()).to.be.oneOf([
          'foo',
          'Moderate',
          'Service Availability',
        ])
      );
      checkNoMatchingRecs();
    });

    it('last breadcrumb is cluster name', () => {
      mount();

      cy.get(BREADCRUMBS)
        .should('have.length', 1)
        .get('.pf-c-breadcrumb__list > :nth-child(2)')
        .should('have.text', CLUSTER_NAME);
    });

    it('last breadcrumb is cluster id when name is not available', () => {
      interceptors['successful, cluster name is null']();
      mount();

      cy.get(BREADCRUMBS)
        .should('have.length', 1)
        .get('.pf-c-breadcrumb__list > :nth-child(2)')
        .should('have.text', CLUSTER_ID);
    });
  });

  describe('in the loading state', () => {
    beforeEach(() => {
      interceptors['long responding']();
    });

    it('renders skeleton', () => {
      mount();

      // renders breadcrumbs
      cy.get(BREADCRUMBS).should('have.length', 1);
      // renders cluster header
      cy.get(CLUSTER_HEADER).should('have.length', 1);
      // renders table component
      cy.get(RULES_TABLE).should('have.length', 1);
    });
  });

  describe('in the error state', () => {
    beforeEach(() => {
      interceptors['server error']();
    });

    it('renders empty state component', () => {
      mount();

      // renders breadcrumbs
      cy.get(BREADCRUMBS).should('have.length', 1);
      // renders cluster header
      cy.get(CLUSTER_HEADER).should('have.length', 1);
      // renders table component
      cy.get(RULES_TABLE).should('have.length', 1);
      cy.get('.pf-c-empty-state').should('have.length', 1);
    });
  });
});
