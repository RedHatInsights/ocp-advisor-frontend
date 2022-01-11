import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { AffectedClustersTable } from './AffectedClustersTable';
import props from '../../../cypress/fixtures/AffectedClustersTable/data.json';
import { Intl } from '../../Utilities/intlHelper';
import getStore from '../../Store';

// selectors
const AFFECTED_LIST_TABLE = 'div[id=affected-list-table]';
const ROW_GROUP = 'tbody[role=rowgroup]';
const PAGINATION_MENU =
  'div[data-ouia-component-type="PF4/PaginationOptionsMenu"]';
const TOOLBAR_CONTENT = '.pf-c-toolbar__content';
const TOOLBAR = '.pf-c-toolbar';
const DEFAULT_ROW_COUNT = 20;
// FIXME is this shared by all tables?
const PAGINATION_VALUES = [10, 20, 50, 100]

// actions
Cypress.Commands.add('countRows', (count) => {
  cy.get(AFFECTED_LIST_TABLE)
    .find(ROW_GROUP)
    .children()
    .should('have.length', count);
});
Cypress.Commands.add('getToggleCheckboxText', () =>
  cy.get(AFFECTED_LIST_TABLE).find(TOOLBAR).find('#toggle-checkbox-text')
);

function filterData(text = '') {
  // FIXME: is this the right way to use loadash?
  return Cypress._.filter(props['enabled'], (it) =>
    (it?.cluster_name || it.cluster).toLowerCase().includes(text.toLowerCase())
  );
}

describe('test data', () => {
  it('has enabled clusters', () => {
    cy.wrap(props['enabled']).its('length').should('be.gte', 1);
  });
  it('has more enabled clusters than default rows', () => {
    cy.wrap(props['enabled']).its('length').should('be.gt', DEFAULT_ROW_COUNT);
  });
  it('has less data than 51', () => {
    // 50 is the value [2] in pagination
    cy.wrap(props['enabled']).its('length').should('be.lte', 50);
  });
});

describe('non-empty successful affected clusters table', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <AffectedClustersTable
              query={{
                isError: false,
                isFetching: false,
                isUninitialized: false,
                isSuccess: true,
                data: props,
              }}
              rule={{}}
              afterDisableFn={() => undefined}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('renders table', () => {
    cy.get(AFFECTED_LIST_TABLE).should('have.length', 1);
  });

  it('shows first twenty clusters', () => {
    cy.countRows(DEFAULT_ROW_COUNT);
  });

  it('pagination defaults are expected ones', () => {
    // FIXME: create a function to get the items in paginator?
    cy.get(PAGINATION_MENU)
      .first()
      .find('button[data-ouia-component-type="PF4/DropdownToggle"]')
      .click();
    cy.get(PAGINATION_MENU)
      .first()
      .find('ul[class=pf-c-options-menu__menu]')
      .find('li')
      .each(($el, index) => {
        cy.wrap($el).should(
          'have.text',
          `${PAGINATION_VALUES[index]} per page`
        );
      });
  });

  it('can change page limit', () => {
    // FIXME: best way to make the loop
    cy.wrap(PAGINATION_VALUES).each((el) => {
      cy.get(PAGINATION_MENU)
        .first()
        .find('button[data-ouia-component-type="PF4/DropdownToggle"]')
        .click();
      cy.get(PAGINATION_MENU)
        .first()
        .find('ul[class=pf-c-options-menu__menu]')
        .find('li')
        .contains(`${el}`)
        .click({ force: true }); // caused by the css issue
      cy.countRows(Math.min(el, filterData().length));
    });
  });

  it('can add name filter', () => {
    cy.get(AFFECTED_LIST_TABLE).find('#name-filter').type('ff');
    // renders filter chips
    cy.get(TOOLBAR_CONTENT).find('.ins-c-chip-filters');
    // three matched clusters rendered
    cy.countRows(2);
  });

  it('display name is rendered instead of cluster uuid', () => {
    cy.get(AFFECTED_LIST_TABLE)
      .find(ROW_GROUP)
      .contains('custom cluster name 2')
      .should('have.attr', 'href')
      .and('contain', '/clusters/f7331e9a-2f59-484d-af52-338d56165df5');
  });

  it('renders table header', () => {
    cy.get(AFFECTED_LIST_TABLE).find('th').should('have.text', 'Name');
  });

  it('can select/deselect all', () => {
    cy.get(AFFECTED_LIST_TABLE).find(TOOLBAR).find('#toggle-checkbox').click();
    cy.getToggleCheckboxText().should('have.text', '23 selected');
    cy.get(AFFECTED_LIST_TABLE)
      .find(TOOLBAR)
      .find('.pf-c-dropdown__toggle')
      .find('button')
      .click();
    cy.get(AFFECTED_LIST_TABLE)
      .find(TOOLBAR)
      .find('ul[class=pf-c-dropdown__menu]')
      .find('li')
      .eq(1)
      .click({ force: true });
    cy.getToggleCheckboxText().should('not.exist');
  });

  it('can disable selected clusters', () => {
    cy.get(AFFECTED_LIST_TABLE).find(TOOLBAR).find('#toggle-checkbox').click();
    cy.get(AFFECTED_LIST_TABLE)
      .find(TOOLBAR)
      .find('button[aria-label=Actions]')
      .click();
    cy.get('.pf-c-dropdown__menu')
      .find('li')
      .find('button')
      .click({ force: true });
    cy.get('.pf-c-modal-box')
      .find('.pf-c-check label')
      .should('have.text', 'Disable recommendation for selected clusters');
  });

  it('can disable one cluster', () => {
    cy.get(AFFECTED_LIST_TABLE)
      .find(ROW_GROUP)
      .children()
      .eq(0)
      .find('.pf-c-table__action button')
      .click({ force: true });
    cy.get(AFFECTED_LIST_TABLE)
      .find(ROW_GROUP)
      .children()
      .eq(0)
      .find('.pf-c-dropdown__menu button')
      .click({ force: true });
    cy.get('.pf-c-modal-box')
      .find('.pf-c-check label')
      .should('have.text', 'Disable only for this cluster');
  });
});

describe('empty successful affected clusters table', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <AffectedClustersTable
              query={{
                isError: false,
                isFetching: false,
                isUninitialized: false,
                isSuccess: true,
                data: { disabled: [], enabled: [] },
              }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('cannot add filters to empty table', () => {
    cy.get(AFFECTED_LIST_TABLE).find('#name-filter').type('foobar');
    cy.get(TOOLBAR_CONTENT).find('.ins-c-chip-filters').should('not.exist');
  });

  it('renders no clusters message', () => {
    cy.get('#empty-state-message')
      .find('h4')
      .should('have.text', 'No clusters');
  });

  it('renders table header', () => {
    cy.get(AFFECTED_LIST_TABLE).find('th').should('have.text', 'Name');
  });
});

describe('empty failed affected clusters table', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <AffectedClustersTable
              query={{
                isError: true,
                isFetching: false,
                isUninitialized: false,
                isSuccess: false,
                data: undefined,
              }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('cannot add filters to empty table', () => {
    cy.get(AFFECTED_LIST_TABLE).find('#name-filter').type('foobar');
    cy.get(TOOLBAR_CONTENT).find('.ins-c-chip-filters').should('not.exist');
  });

  it('renders error message', () => {
    cy.get('#error-state-message')
      .find('h4')
      .should('have.text', 'Something went wrong');
  });

  it('renders table header', () => {
    cy.get(AFFECTED_LIST_TABLE).find('th').should('have.text', 'Name');
  });
});
