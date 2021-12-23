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

// actions
Cypress.Commands.add('countRows', (count) => {
  cy.get(AFFECTED_LIST_TABLE)
    .find(ROW_GROUP)
    .children()
    .should('have.length', count);
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
    cy.countRows(20);
  });

  it('can change page limit', () => {
    cy.countRows(20);

    cy.get(PAGINATION_MENU)
      .first()
      .find('button[data-ouia-component-type="PF4/DropdownToggle"]')
      .click();
    cy.get(PAGINATION_MENU)
      .first()
      .find('ul[class=pf-c-options-menu__menu]')
      .find('li')
      .eq(2)
      .find('button')
      .click({ force: true }); // caused by the css issue
    cy.countRows(23);
  });

  it('can add name filter', () => {
    cy.get(AFFECTED_LIST_TABLE).find('#name-filter').type('ff');
    // renders filter chips
    cy.get(TOOLBAR_CONTENT).find('.ins-c-chip-filters');
    // three matched clusters rendered
    cy.countRows(3);
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
                data: [],
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
