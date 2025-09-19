import React from 'react';
import updateRisksFixtures from '../../../cypress/fixtures/api/insights-results-aggregator/v2/cluster/dcb95bbf-8673-4f3a-a63c-12d4a530aa6f/upgrade-risks-prediction.json';
import UpdateRisksTable from './UpdateRisksTable';
import { updateRisksInterceptors as interceptors } from '../../../cypress/utils/interceptors';

import {
  TABLE_HEADER,
  checkEmptyState,
  checkTableHeaders,
} from '@redhat-cloud-services/frontend-components-utilities';

const SEVERITY_MAPPING = {
  critical: 'Critical',
  warning: 'Warning',
  info: 'Info',
};

const SEVERITY_ICON_CLASS_MAPPING = {
  critical: 'danger',
  warning: 'warning',
  info: 'info',
};

const CLUSTER_ID = 'dcb95bbf-8673-4f3a-a63c-12d4a530aa6f';

const mount = (initialEntries = [`/clusters/${CLUSTER_ID}`]) => {
  cy.mountWithContext(<UpdateRisksTable />, {
    path: '/clusters/:clusterId',
    routerProps: { initialEntries },
  });
};

const TABLE_ROW = '[data-ouia-component-type="PF6/TableRow"]';

describe('successful with some risks', () => {
  beforeEach(() => {
    interceptors.successful();
    mount();
  });

  it('renders main headers', () => {
    cy.get('#update-risks-table');
    cy.get(TABLE_HEADER).contains('Name');
    cy.get(TABLE_ROW).contains('Alerts firing');
    cy.get(TABLE_ROW).contains('Cluster operators');
  });

  it('shows correct risks number', () => {
    cy.get('#alerts-label').should(
      'have.text',
      `${updateRisksFixtures.upgrade_recommendation.upgrade_risks_predictors.alerts.length} update risks`
    );
    cy.get('#operator-conditions-label').should(
      'have.text',
      `${updateRisksFixtures.upgrade_recommendation.upgrade_risks_predictors.operator_conditions.length} update risks`
    );
  });

  it('shows correct icons', () => {
    cy.get('.alerts__header')
      .find('.pf-v6-c-icon__content')
      .should('have.class', 'pf-m-danger');
    cy.get('.operators__header')
      .find('.pf-v6-c-icon__content')
      .should('have.class', 'pf-m-warning');
  });

  it('has alerts table', () => {
    cy.get('.alerts__content').should('be.visible');
    cy.get('.alerts__content').within(() => {
      checkTableHeaders(['Name', 'Status', 'Namespace']);
      cy.get('tbody')
        .find(TABLE_ROW)
        .each(($row, index) => {
          const alert =
            updateRisksFixtures.upgrade_recommendation.upgrade_risks_predictors
              .alerts[index];
          if (alert.url) {
            cy.get($row)
              .find('.alerts__name a')
              .should('have.text', alert.name)
              .and('have.attr', 'href', alert.url);
          } else {
            cy.get($row).find('.alerts__name').should('have.text', alert.name);
          }
          cy.get($row)
            .find('.alerts__severity')
            .should('contain.text', SEVERITY_MAPPING[alert.severity]);
          cy.get($row)
            .find('.pf-v6-c-icon__content')
            .should(
              'have.class',
              `pf-m-${SEVERITY_ICON_CLASS_MAPPING[alert.severity]}`
            );
          cy.get($row)
            .find('.alerts__namespace')
            .should('have.text', alert.namespace);
        });
    });
  });

  it('has operator conditions table', () => {
    cy.get('.operators__content').should('be.visible');
    cy.get('.operators__content').within(() => {
      checkTableHeaders(['Name', 'Status', 'Message']);
      cy.get('tbody')
        .find(TABLE_ROW)
        .each(($row, index) => {
          const condition =
            updateRisksFixtures.upgrade_recommendation.upgrade_risks_predictors
              .operator_conditions[index];
          if (condition.url) {
            cy.get($row)
              .find('.operators__name a')
              .should('have.text', condition.name)
              .and('have.attr', 'href', condition.url);
          } else {
            cy.get($row)
              .find('.operators__name')
              .should('have.text', condition.name);
          }
          cy.get($row)
            .find('.operators__name')
            .should('have.text', condition.name);
          cy.get($row)
            .find('.operators__status')
            .should('contain.text', condition.condition);
          cy.get($row)
            .find('.operators__status .pf-v6-c-icon__content')
            .should('have.class', `pf-m-warning`);
          cy.get($row)
            .find('.operators__message')
            .should('have.text', condition.reason || '-');
        });
    });
  });

  it('can hide content', () => {
    cy.get('.pf-v6-c-table__toggle button').eq(0).click();
    cy.get('.alerts__content').should('not.be.visible');

    cy.get('.pf-v6-c-table__toggle button').eq(1).click();
    cy.get('.operators__content').should('not.be.visible');
  });
});

describe('successful, only cluster operators', () => {
  beforeEach(() => {
    interceptors['successful, alerts empty']();
    mount();
  });

  it('shows 0 alert risks', () => {
    cy.get('#alerts-label')
      .should('have.text', `0 update risks`)
      .and('have.class', 'pf-m-green');
  });

  it('shows check icon', () => {
    cy.get('.alerts__header')
      .find('.pf-v6-c-icon__content')
      .should('have.class', 'pf-m-success');
  });
});

describe('successful, empty', () => {
  beforeEach(() => {
    interceptors['successful, empty']();
    mount();
  });

  it('renders empty state', () => {
    checkEmptyState('No update risks found for this cluster', true);
  });

  it('header is present', () => {
    cy.get(TABLE_HEADER).contains('Name');
  });
});

describe('error, service down', () => {
  beforeEach(() => {
    interceptors['error, not available']();
    mount();
  });

  it('renders empty state', () => {
    // can't apply checkEmptyState since "something went wrong" component doesn't use OUIA id
    cy.get('.pf-v6-c-empty-state h4').should(
      'have.text',
      'Something went wrong'
    );
    cy.get('.pf-v6-c-empty-state__icon').should('be.visible');
  });

  it('header is present', () => {
    cy.get(TABLE_HEADER).contains('Name');
  });
});

describe('error, not found', () => {
  beforeEach(() => {
    interceptors['error, not found']();
    mount();
  });

  it('renders empty state', () => {
    checkEmptyState('Update risks are not available', true);
  });

  it('header is present', () => {
    cy.get(TABLE_HEADER).contains('Name');
  });
});

describe('error, other', () => {
  beforeEach(() => {
    interceptors['error, other']();
    mount();
  });

  it('renders empty state', () => {
    // can't apply checkEmptyState since "something went wrong" component doesn't use OUIA id
    cy.get('.pf-v6-c-empty-state h4').should(
      'have.text',
      'Something went wrong'
    );
    cy.get('.pf-v6-c-empty-state__icon').should('be.visible');
  });

  it('header is present', () => {
    cy.get(TABLE_HEADER).contains('Name');
  });
});

describe('loading', () => {
  beforeEach(() => {
    interceptors['long responding']();
    mount();
  });

  it('renders spinner', () => {
    cy.get('.pf-v6-c-spinner').should('be.visible');
    cy.get('#update-risks-table').should('not.exist');
  });
});
