import React from 'react';
import { mount } from '@cypress/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import getStore from '../../Store';
import ClusterRules from './ClusterRules';
import '@patternfly/patternfly/patternfly.scss';

describe('cluster rules table', () => {
  beforeEach(() => {
    // tables utilizes federated module and throws error when RHEL Advisor manifestaion not found
    window['__scalprum__'] = {
      apps: {},
      appsMetaData: {
        advisor: {
          manifestLocation:
            'https://qa.console.redhat.com/beta/apps/advisor/fed-mods.json',
          module: 'advisor#./RootApp',
          name: 'advisor',
        },
      },
    };
    cy.intercept('*', (req) => {
      req.destroy();
    });

    cy.fixture(
      'api/insights-results-aggregator/v1/clusters/41c30565-b4c9-49f2-a4ce-3277ad22b258/report.json'
    ).then((reports) => {
      mount(
        <IntlProvider locale="en">
          <Provider store={getStore()}>
            <MemoryRouter
              initialEntries={[
                '/clusters/41c30565-b4c9-49f2-a4ce-3277ad22b258',
              ]}
              initialIndex={0}
            >
              <Route path="/clusters/:clusterId">
                <ClusterRules reports={reports} />
              </Route>
            </MemoryRouter>
          </Provider>
        </IntlProvider>
      );
    });
  });

  it('renders ClusterRules', () => {
    cy.get('div[id=cluster-recs-list-table]').should('have.length', 1);
  });

  it('first item expanded', () => {
    cy.get('#expanded-content1').should('have.length', 1);
  });
  it('expand all, collapse all', () => {
    const TOOLBAR = '[class="pf-c-toolbar__item"]';
    const EXPANDABLES = '[class="pf-c-table__expandable-row pf-m-expanded"]';

    cy.get(TOOLBAR).find('button').click();
    cy.get(EXPANDABLES).should('have.length', 6);
    cy.get(TOOLBAR).find('button').click();
    cy.get(EXPANDABLES).should('have.length', 0);
  });

  it('sort by total risk', () => {
    const TOTAL_RISK_COL = 'td[data-label="Total risk"]';

    cy.get(TOTAL_RISK_COL).should('have.length', 6);
    cy.get('th[data-label="Total risk"]').find('button').click();
    cy.get(TOTAL_RISK_COL)
      .should('have.length', 6)
      .first()
      .should('have.text', 'Low');
    cy.get(TOTAL_RISK_COL).last().should('have.text', 'Critical');
  });
});

describe('cluster rules table testing the first query parameter', () => {
  beforeEach(() => {
    // tables utilizes federated module and throws error when RHEL Advisor manifestaion not found
    window['__scalprum__'] = {
      apps: {},
      appsMetaData: {
        advisor: {
          manifestLocation:
            'https://qa.console.redhat.com/beta/apps/advisor/fed-mods.json',
          module: 'advisor#./RootApp',
          name: 'advisor',
        },
      },
    };
    cy.intercept('*', (req) => {
      req.destroy();
    });

    cy.fixture(
      'api/insights-results-aggregator/v1/clusters/41c30565-b4c9-49f2-a4ce-3277ad22b258/report.json'
    ).then((reports) => {
      mount(
        <IntlProvider locale="en">
          <Provider store={getStore()}>
            <MemoryRouter
              initialEntries={[
                '/clusters/41c30565-b4c9-49f2-a4ce-3277ad22b258?first=external.rules.rule_n_one|ERROR_KEY_N2',
              ]}
              initialIndex={0}
            >
              <Route path="/clusters/:clusterId">
                <ClusterRules reports={reports} />
              </Route>
            </MemoryRouter>
          </Provider>
        </IntlProvider>
      );
    });
  });

  it('Sorts the table correctly when the first query parameter is passed', () => {
    cy.get('div[id=cluster-recs-list-table]')
      .find('td[data-label=Description]')
      .children()
      .eq(0)
      .should('have.text', 'testing the first query parameter ');
  });
});
