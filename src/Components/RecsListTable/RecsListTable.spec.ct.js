import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { RecsListTable } from './RecsListTable';
import getStore from '../../Store';
import props from '../../../cypress/fixtures/RecsListTable/data.json';
import { Intl } from '../../Utilities/intlHelper';

// selectors
const RECS_LIST_TABLE = 'div[id=recs-list-table]';
const CHIP = 'div[class=pf-c-chip]';
const ROW = 'tbody[role=rowgroup]';
const FILTERS_DROPDOWN = 'ul[class=pf-c-dropdown__menu]';
const FILTER_TOGGLE = 'span[class=pf-c-select__toggle-arrow]';
// actions
Cypress.Commands.add('getAllRows', () => cy.get(RECS_LIST_TABLE).find(ROW));
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
Cypress.Commands.add('getRowByName', (name) => {
  cy.contains(ROW, name);
});
Cypress.Commands.add('clickOnRowKebab', (name) => {
  cy.contains(ROW, name).find('.pf-c-dropdown__toggle').click();
});
Cypress.Commands.add('getColumns', () => {
  cy.get(RECS_LIST_TABLE).find('table > thead > tr > th');
});
Cypress.Commands.add('sortByCol', (colIndex) => {
  cy.getColumns()
    .eq(colIndex)
    .find('span[class=pf-c-table__sort-indicator]')
    .click({ force: true });
});
const getChipGroup = (label) =>
  cy.contains('.pf-c-chip-group__label', label).parent();

before(() => {
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
});

describe('pre-filled url search parameters', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter
        initialEntries={[
          '/recommendations?text=123|FOO_BAR&total_risk=4,3&impact=1,2&likelihood=1&category=1,2&rule_status=disabled&impacting=false',
        ]}
        initialIndex={0}
      >
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

  // TODO: use Messages.js to match labels and names
  it('recognizes text parameter', () => {
    // text input contains the value
    getChipGroup('Name').contains('.pf-c-chip', '123|FOO_BAR');
    // text filter chip is present
    cy.get('.pf-m-fill > .pf-c-form-control').should(
      'have.value',
      '123|FOO_BAR'
    );
  });

  it('recognizes multiselect parameters', () => {
    getChipGroup('Total risk').contains('.pf-c-chip', 'Critical');
    getChipGroup('Impact').contains('.pf-c-chip', 'Low');
    getChipGroup('Total risk').contains('.pf-c-chip', 'Important');
    getChipGroup('Impact').contains('.pf-c-chip', 'Medium');
    getChipGroup('Likelihood').contains('.pf-c-chip', 'Low');
    getChipGroup('Category').contains('.pf-c-chip', 'Service Availability');
    getChipGroup('Category').contains('.pf-c-chip', 'Performance');
  });

  it('recognizes rule status parameter', () => {
    getChipGroup('Status').contains('.pf-c-chip', 'Disabled');
  });

  it('recognizes impacting parameter ', () => {
    getChipGroup('Clusters impacted').contains('.pf-c-chip', 'None');
  });
});

describe('successful non-empty recommendations list table', () => {
  beforeEach(() => {
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

  it('should have 5 sortable columns', () => {
    cy.getColumns()
      .should('have.length', 5)
      .should('have.class', 'pf-c-table__sort');
  });

  it('sort the data by Name', () => {
    cy.sortByCol(0);
    cy.getAllRows()
      .eq(0)
      .find('td[data-label=Name]')
      .should(
        'contain',
        'Additional risks would occur possibly when having the masters defined as machinesets'
      );
    cy.sortByCol(0);
    cy.getAllRows()
      .eq(0)
      .find('td[data-label=Name]')
      .should(
        'contain',
        'Super atomic nuclear cluster on the brink of the world destruction'
      );
  });

  it('sort the data by Added', () => {
    cy.sortByCol(1);
    cy.getAllRows()
      .eq(0)
      .find('td[data-label=Name]')
      .should(
        'contain',
        'Additional risks would occur possibly when having the masters defined as machinesets'
      );
    cy.sortByCol(1);
    cy.getAllRows()
      .eq(0)
      .find('td[data-label=Name]')
      .should(
        'contain',
        'Super atomic nuclear cluster on the brink of the world destruction'
      );
  });

  //had to add \\ \\ to the Total risk, otherwise jQuery engine would throw an error
  it('sort the data by Total Risk', () => {
    cy.sortByCol(3);
    cy.getAllRows()
      .eq(0)
      .find('td[data-label="Total risk"]')
      .should('contain', 'Moderate');
    cy.sortByCol(3);
    cy.getAllRows()
      .eq(0)
      .find('td[data-label="Total risk"]')
      .should('contain', 'Critical');
  });

  it('sort the data by Clusters', () => {
    cy.sortByCol(4);
    cy.getAllRows()
      .eq(0)
      .find('td[data-label="Clusters"]')
      .should('contain', '1');
    cy.sortByCol(4);
    cy.getAllRows()
      .eq(0)
      .find('td[data-label="Clusters"]')
      .should('contain', '2,003');
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
    cy.getAllRows().should('have.length', 5);
    cy.getRowByName('disabled rule with 2 impacted')
      .find('span[class=pf-c-label]')
      .should('have.text', 'Disabled');
  });

  it('each row has a kebab', () => {
    cy.get(RECS_LIST_TABLE)
      .find('tbody[role=rowgroup] .pf-c-dropdown__toggle')
      .should('have.length', 4);
  });

  it('enabled rule has the disable action', () => {
    cy.clickOnRowKebab(
      'Super atomic nuclear cluster on the brink of the world destruction'
    );
    cy.getRowByName(
      'Super atomic nuclear cluster on the brink of the world destruction'
    )
      .find('.pf-c-dropdown__menu button')
      .should('have.text', 'Disable recommendation');
  });

  it('disabled rule has the enable action', () => {
    cy.removeStatusFilter();
    cy.removeImpactingFilter();
    cy.clickOnRowKebab('disabled rule with 2 impacted');
    cy.getRowByName('disabled rule with 2 impacted')
      .find('.pf-c-dropdown__menu button')
      .should('have.text', 'Enable recommendation');
  });

  it('default sort by total risk', () => {
    cy.get(ROW)
      .children()
      .eq(0)
      .find('td[data-label="Total risk"]')
      .contains('Critical');
  });

  it('can sort by category', () => {
    cy.sortByCol(2);
    cy.getAllRows()
      .eq(0)
      .find('td[data-label=Name]')
      .should(
        'contain',
        'Additional risks would occur possibly when having the masters defined as machinesets'
      );
    cy.getAllRows()
      .eq(0)
      .find('td[data-label=Category]')
      .should('contain', 'Performance');
    cy.sortByCol(2);
    cy.getAllRows()
      .eq(0)
      .find('td[data-label=Category]')
      .should('contain', 'Service Availability');
  });

  it('the Impacted filters work correctly', () => {
    cy.get(RECS_LIST_TABLE)
      .find('button[class=pf-c-dropdown__toggle]')
      .click({ force: true });
    cy.get(FILTERS_DROPDOWN)
      .contains('Clusters impacted')
      .click({ force: true });
    cy.get(FILTER_TOGGLE).then((element) => {
      cy.wrap(element);
      element[0].click({ force: true });
    });
    cy.get('.pf-c-select__menu')
      .find('label > input')
      .eq(1)
      .check({ force: true });
    cy.get('.pf-c-chip-group__list-item').contains('1 or more');

    cy.get(RECS_LIST_TABLE)
      .find('button[class=pf-c-dropdown__toggle]')
      .click({ force: true });
    cy.get(FILTERS_DROPDOWN).contains('Status').click({ force: true });
    cy.get(FILTER_TOGGLE).click({ force: true });
    cy.get('button[class=pf-c-select__menu-item]')
      .contains('All')
      .click({ force: true });
    cy.get('.pf-c-chip-group__list-item').contains('1 or more');
  });
});

describe('empty recommendations list table', () => {
  beforeEach(() => {
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
                data: { recommendations: [], status: 'ok' },
              }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('renders error message', () => {
    cy.get('#error-state-message')
      .find('h4')
      .should('have.text', 'Something went wrong');
  });
});
