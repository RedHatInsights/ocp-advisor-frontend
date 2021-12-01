import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { RecsListTable } from './RecsListTable';
import getStore from '../../Store';
import props from '../../../cypress/fixtures/RecsListTable/data.json';
import { Intl } from '../../Utilities/intlHelper';

describe('recommendations list table', () => {
  // selectors
  const RECS_LIST_TABLE = 'div[id=recs-list-table]';
  const CHIP = 'div[class=pf-c-chip]';

  Cypress.Commands.add('getAllRows', () =>
    cy.get(RECS_LIST_TABLE).find('tbody[role=rowgroup]')
  );
  Cypress.Commands.add('removeStatusFilter', () => {
    cy.get(CHIP)
      .contains('Enabled')
      .parent()
      .find('button[data-ouia-component-id=close]')
      .click();
  });
  Cypress.Commands.add('removeImpactingFilter', () => {
    cy.get(CHIP)
      .contains('1 or more')
      .parent()
      .find('button[data-ouia-component-id=close]')
      .click();
  });
  Cypress.Commands.add('clickOnFirstRowKebab', () => {
    cy.get(RECS_LIST_TABLE)
      .find('tbody[role=rowgroup] .pf-c-dropdown__toggle')
      .eq(0)
      .click();
  });

  beforeEach(() => {
    cy.intercept('*', (req) => {
      req.destroy();
    });
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
      <MemoryRouter initialEntries={['/recommendations']} initialIndex={0}>
        <Intl>
          <Provider store={getStore()}>
            <RecsListTable
              query={{
                isError: false,
                isFetching: false,
                isUninitialized: false,
                isSuccess: true,
                data: props,
              }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('renders table', () => {
    cy.get(RECS_LIST_TABLE).should('have.length', 1);
  });

  it('renders Clusters impacted chip group', () => {
    cy.get(RECS_LIST_TABLE).should('have.length', 1);
    cy.get(RECS_LIST_TABLE)
      .find('span[class=pf-c-chip-group__label]')
      .should('have.length', 2)
      .eq(0)
      .and('have.text', 'Clusters impacted');
    cy.get(RECS_LIST_TABLE)
      .find('span[class=pf-c-chip-group__label]')
      .eq(1)
      .and('have.text', 'Status');
    cy.get(RECS_LIST_TABLE)
      .find('li[class=pf-c-chip-group__list-item]')
      .should('have.length', 2)
      .eq(0)
      .and('have.text', '1 or more');
    cy.get(RECS_LIST_TABLE)
      .find('li[class=pf-c-chip-group__list-item]')
      .eq(1)
      .and('have.text', 'Enabled');
  });

  it('7 filters available', () => {
    const FILTERS_DROPDOWN = 'ul[class=pf-c-dropdown__menu]';
    const FILTER_ITEM = 'button[class=pf-c-dropdown__menu-item]';

    cy.get(RECS_LIST_TABLE)
      .should('have.length', 1)
      .find('button[class=pf-c-dropdown__toggle]')
      .should('have.length', 1)
      .click();
    cy.get(FILTERS_DROPDOWN).find(FILTER_ITEM).should('have.length', 7);
    cy.get(FILTERS_DROPDOWN)
      .find(FILTER_ITEM)
      .each(($el) =>
        expect($el.text()).to.be.oneOf([
          'Name',
          'Total risk',
          'Impact',
          'Likelihood',
          'Category',
          'Clusters impacted',
          'Status',
        ])
      );
  });

  it('table has 4 recs', () => {
    cy.getAllRows().should('have.length', 4);
  });

  it('table has 7 recs including non-impacting', () => {
    cy.removeImpactingFilter();
    cy.getAllRows().should('have.length', 7);
  });

  it('should have 4 sortable columns', () => {
    cy.get('table[class="pf-c-table pf-m-grid-md pf-m-compact"]').should(
      'have.length',
      1
    );
    cy.get('th[class="pf-c-table__sort pf-m-width-70"]').should(
      'have.length',
      1
    );
    cy.get('th[class="pf-c-table__sort pf-m-width-10"]').should(
      'have.length',
      3
    );
  });

  it('sort the data by Name', () => {
    cy.get(RECS_LIST_TABLE)
      .get('span[class=pf-c-table__sort-indicator]')
      .first()
      .click({ force: true });
    cy.get('td[data-label=Name]> span > a:first').should(
      'have.text',
      ' Additional risks would occur possibly when having the masters defined as machinesets '
    );
    cy.get('span[class=pf-c-table__sort-indicator]')
      .first()
      .click({ force: true });
    cy.get('td[data-label=Name] > span > a:first').should(
      'have.text',
      ' Super atomic nuclear cluster on the brink of the world destruction '
    );
  });

  it('sort the data by Added', () => {
    cy.get(RECS_LIST_TABLE)
      .get('span[class=pf-c-table__sort-indicator]')
      .eq(1)
      .click({ force: true });
    cy.get('td[data-label=Name] > span > a:first').should(
      'have.text',
      ' Additional risks would occur possibly when having the masters defined as machinesets '
    );
    cy.get('span[class=pf-c-table__sort-indicator]')
      .eq(1)
      .click({ force: true });
    cy.get('td[data-label=Name] > span > a:first').should(
      'have.text',
      ' Super atomic nuclear cluster on the brink of the world destruction '
    );
  });

  //had to add \\ \\ to the Total risk, otherwise jQuery engine would throw an error
  it('sort the data by Total Risk', () => {
    cy.get(RECS_LIST_TABLE)
      .get('span[class=pf-c-table__sort-indicator]')
      .eq(2)
      .click({ force: true });
    cy.get('td[data-label=Total\\ \\risk]')
      .find('span[class=pf-c-label__content]')
      .should(($span) => {
        expect($span[0]).to.have.text('Moderate');
      });
    cy.get('span[class=pf-c-table__sort-indicator]')
      .eq(2)
      .click({ force: true });
    cy.get('td[data-label=Total\\ \\risk]')
      .find('span[class=pf-c-label__content]')
      .should(($span) => {
        expect($span[0]).to.have.text('Critical');
      });
  });

  it('sort the data by Clusters', () => {
    cy.get(RECS_LIST_TABLE)
      .get('span[class=pf-c-table__sort-indicator]')
      .eq(3)
      .click({ force: true });
    cy.get('td[data-label=Clusters] > div:first').should('have.text', '1');
    cy.get('span[class=pf-c-table__sort-indicator]')
      .eq(3)
      .click({ force: true });
    cy.get('td[data-label=Clusters] > div:first').should('have.text', '2,003');
  });

  it('include disabled rules', () => {
    cy.removeStatusFilter();
    cy.getAllRows()
      .should('have.length', 5)
      .find('td[data-label="Name"]')
      .contains('disabled rule with 2 impacted')
      .should('have.length', 1);
  });

  it('disabled rule has a label', () => {
    cy.removeStatusFilter();
    cy.getAllRows()
      .should('have.length', 5)
      .eq(0)
      .find('span[class=pf-c-label]')
      .should('have.text', 'Disabled');
  });

  it('each row has a kebab', () => {
    cy.get(RECS_LIST_TABLE)
      .find('tbody[role=rowgroup] .pf-c-dropdown__toggle')
      .should('have.length', 4);
  });

  it('enabled rule has the disable action', () => {
    cy.clickOnFirstRowKebab();
    cy.getAllRows()
      .eq(0)
      .find('.pf-c-dropdown__menu button')
      .should('have.text', 'Disable recommendation');
  });

  it('disabled rule has the enable action', () => {
    cy.removeStatusFilter();
    cy.removeImpactingFilter();
    cy.clickOnFirstRowKebab();
    cy.getAllRows()
      .eq(0)
      .find('.pf-c-dropdown__menu button')
      .should('have.text', 'Enable recommendation');
  });
});
