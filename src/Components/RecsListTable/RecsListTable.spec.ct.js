import React from 'react';
import { mount } from '@cypress/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import RecsListTable from './';
import getStore from '../../Store';

describe('recommendations list table', () => {
  beforeEach(() => {
    cy.intercept('*', (req) => {
      req.destroy();
    });
    cy.intercept(
      'GET',
      'api/insights-results-aggregator/v2/rule?impacting=false',
      { fixture: 'api/insights-results-aggregator/v2/rule.json' }
    );
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
    mount(
      <IntlProvider locale="en">
        <Provider store={getStore()}>
          <MemoryRouter initialEntries={['/recommendations']} initialIndex={0}>
            <RecsListTable />
          </MemoryRouter>
        </Provider>
      </IntlProvider>
    );
  });
  it('renders table', () => {
    cy.get('div[id=recs-list-table]').should('have.length', 1);
  });
  it('renders Clusters impacted chip group', () => {
    cy.get('div[id=recs-list-table]').should('have.length', 1);
    cy.get('div[id=recs-list-table]')
      .find('span[class=pf-c-chip-group__label]')
      .should('have.length', 1)
      .and('have.text', 'Clusters impacted');
    cy.get('div[id=recs-list-table]')
      .find('li[class=pf-c-chip-group__list-item]')
      .should('have.length', 1)
      .and('have.text', '1 or more');
  });
  it('six filters available', () => {
    cy.get('div[id=recs-list-table]')
      .should('have.length', 1)
      .find('button[class=pf-c-dropdown__toggle]')
      .should('have.length', 1)
      .click();
    cy.get('ul[class=pf-c-dropdown__menu]')
      .find('button[class=pf-c-dropdown__menu-item]')
      .should('have.length', 6);
    cy.get('ul[class=pf-c-dropdown__menu]')
      .find('button[class=pf-c-dropdown__menu-item]')
      .each(($el) =>
        expect($el.text()).to.be.oneOf([
          'Name',
          'Total risk',
          'Impact',
          'Likelihood',
          'Category',
          'Clusters impacted',
        ])
      );
  });
  it('table has 5 recs', () => {
    cy.get('table[data-ouia-component-id=recsListTable]')
      .should('have.length', 1)
      .find('tbody[role=rowgroup]')
      .should('have.length', 5);
  });
  it('table has 9 recs including non-impacting', () => {
    cy.get('div[class=pf-c-chip]')
      .contains('1 or more')
      .parent()
      .find('button[data-ouia-component-id=close]')
      .click();
    cy.get('table[data-ouia-component-id=recsListTable]')
      .should('have.length', 1)
      .find('tbody[role=rowgroup]')
      .should('have.length', 9);
  });
});
