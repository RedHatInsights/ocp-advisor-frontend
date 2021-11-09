import React from 'react';
import { mount } from '@cypress/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import getStore from '../../Store';
import AffectedClustersTable from './';

describe('affected clusters table', () => {
  const AFFECTED_LIST_TABLE = 'div[id=affected-list-table]';
  const ROW = 'tbody[role=rowgroup]';

  beforeEach(() => {
    cy.intercept('*', (req) => {
      req.destroy();
    });
    cy.intercept(
      'GET',
      'api/insights-results-aggregator/v2/rule/external.rules.rule_n_one%7CERROR_KEY_N1/clusters_detail',
      {
        fixture:
          'api/insights-results-aggregator/v2/rule/external.rules.rule_n_one%7CERROR_KEY_N1/clusters_detail.json',
      }
    );
    mount(
      <IntlProvider locale="en">
        <Provider store={getStore()}>
          <MemoryRouter
            initialEntries={[
              '/recommendations/external.rules.rule_n_one|ERROR_KEY_N1',
            ]}
            initialIndex={0}
          >
            <Route path="/recommendations/:recommendationId">
              <AffectedClustersTable />
            </Route>
          </MemoryRouter>
        </Provider>
      </IntlProvider>
    );
  });

  it('renders table', () => {
    cy.get(AFFECTED_LIST_TABLE).should('have.length', 1);
  });

  it('shows first ten clusters', () => {
    cy.get(AFFECTED_LIST_TABLE).find(ROW).children().should('have.length', 10);
  });

  it('paginatation feature', () => {
    const PAGINATION_MENU =
      'div[data-ouia-component-type="PF4/PaginationOptionsMenu"]';

    cy.get(AFFECTED_LIST_TABLE).find(ROW).children().should('have.length', 10);
    cy.get(PAGINATION_MENU)
      .first()
      .find('button[data-ouia-component-type="PF4/DropdownToggle"]')
      .click();
    cy.get(PAGINATION_MENU)
      .first()
      .find('ul[class=pf-c-options-menu__menu]')
      .find('li')
      .eq(1)
      .find('button')
      .click({ force: true }); // caused by the css issue
    cy.get(AFFECTED_LIST_TABLE).find(ROW).children().should('have.length', 12);
  });
});
