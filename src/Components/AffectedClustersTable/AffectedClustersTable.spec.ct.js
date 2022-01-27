import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import filter from 'lodash/filter';

import { AffectedClustersTable } from './AffectedClustersTable';
import data from '../../../cypress/fixtures/AffectedClustersTable/data.json';
import { Intl } from '../../Utilities/intlHelper';
import getStore from '../../Store';
import '@patternfly/patternfly/patternfly.scss';
import { filterableTable } from '../../../cypress/views/filterableTable';

const view = filterableTable;

// selectors
const TABLE = 'div[id=affected-list-table]';
const DEFAULT_ROW_COUNT = 20;
// FIXME is this shared by all tables?
const PAGINATION_VALUES = [10, 20, 50, 100];
const SEARCH_ITEMS = ['ff', 'CUSTOM', 'Foobar', 'Not existing cluster'];

function filterData(text = '') {
  // FIXME: is this the right way to use loadash?
  return filter(data['enabled'], (it) =>
    (it?.cluster_name || it.cluster).toLowerCase().includes(text.toLowerCase())
  );
}

// FIXME improve syntax
// FIXME move to utils module
function itemsPerPage() {
  let items = filterData().length;
  const array = [];
  while (items > 0) {
    const remain = items - DEFAULT_ROW_COUNT;
    let v = remain > 0 ? DEFAULT_ROW_COUNT : items;
    array.push(v);
    items = remain;
  }
  return array;
}

describe('test data', () => {
  it('has enabled clusters', () => {
    cy.wrap(data['enabled']).its('length').should('be.gte', 1);
  });
  it('has more enabled clusters than default rows', () => {
    cy.wrap(data['enabled']).its('length').should('be.gt', DEFAULT_ROW_COUNT);
  });
  it('has less data than 51', () => {
    // 50 is the value [2] in pagination
    cy.wrap(data['enabled']).its('length').should('be.lte', 50);
  });
  it('has more than one enabled clusters with "custom" in name', () => {
    cy.wrap(filterData('custom')).its('length').should('be.gt', 1);
  });
  it('has one enabled clusters with "foobar" in name', () => {
    cy.wrap(filterData('foobar')).its('length').should('be.eq', 1);
  });
  it('has none enabled clusters with "Not existing cluster" in name', () => {
    cy.wrap(filterData('Not existing cluster'))
      .its('length')
      .should('be.eq', 0);
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
                data: data,
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
    view.isDisplayed('affected-list-table');
  });

  it('shows first twenty clusters', () => {
    view.checkRowCounts(DEFAULT_ROW_COUNT);
  });

  it('pagination defaults are expected ones', () => {
    view.pagination.checkValues(PAGINATION_VALUES);
  });

  it('can change page limit', () => {
    // FIXME: best way to make the loop
    cy.wrap(PAGINATION_VALUES).each((el) => {
      view.pagination.changeValue(el);
      view.checkRowCounts(Math.min(el, filterData().length));
    });
  });

  // outer loop required to clean up filter bar
  SEARCH_ITEMS.forEach((el) => {
    it(`can add name filter (${el})`, () => {
      cy.get(TABLE).find('#name-filter').type(el);
      // renders filter chips
      view.chips().should('contain', 'Name').and('contain', el);
      // check matched clusters
      cy.wrap(filterData(el)).then((data) => {
        if (data.length === 0) {
          view
            .emptyState()
            .should('contain', 'No matching clusters found')
            .and(
              'contain',
              'To continue, edit your filter settings and search again.'
            );
        } else {
          view.checkRowCounts(Math.min(DEFAULT_ROW_COUNT, data.length));
        }
      });
    });
  });

  it('can clear filters', () => {
    cy.get(TABLE).find('#name-filter').type('custom');
    view.toolbar().find('button').contains('Clear filters').click();
    view.chips().should('not.exist');
    view.checkRowCounts(Math.min(DEFAULT_ROW_COUNT, filterData().length));
  });

  it('display name is rendered instead of cluster uuid', () => {
    view
      .rows()
      .contains('custom cluster name 2')
      .should('have.attr', 'href')
      .and('contain', '/clusters/f7331e9a-2f59-484d-af52-338d56165df5');
  });

  it('renders table header', () => {
    cy.get(TABLE).find('th').children().eq(0).should('have.text', 'Name');
    cy.get(TABLE).find('th').children().eq(1).should('have.text', 'Last seen');
  });

  it('can select/deselect all', () => {
    view.toggleCheckbox().click();
    view
      .toggleCheckboxText()
      .should('have.text', `${filterData().length} selected`);
    view.toolbar().find('.pf-c-dropdown__toggle').find('button').click();
    view
      .toolbar()
      .find('ul[class=pf-c-dropdown__menu]')
      .find('li')
      .eq(1)
      .click({ force: true });
    view.toggleCheckboxText().should('not.exist');
  });

  it('can disable selected clusters', () => {
    view.toggleCheckbox().click();
    view.toolbar().find('button[aria-label=Actions]').click();
    cy.get('.pf-c-dropdown__menu')
      .find('li')
      .find('button')
      .click({ force: true });
    cy.get('.pf-c-modal-box')
      .find('.pf-c-check label')
      .should('have.text', 'Disable recommendation for selected clusters');
  });

  it('can disable one cluster', () => {
    view.rows().eq(0).find('.pf-c-table__action button').click({ force: true });
    view
      .rows()
      .eq(0)
      .find('.pf-c-dropdown__menu button')
      .click({ force: true });
    cy.get('.pf-c-modal-box')
      .find('.pf-c-check label')
      .should('have.text', 'Disable only for this cluster');
  });

  it('can iterate over pages', () => {
    cy.wrap(itemsPerPage()).each((el, index, list) => {
      view.checkRowCounts(el);
      view.pagination.nextButton().then(($button) => {
        if (index === list.length - 1) {
          cy.wrap($button).should('be.disabled');
        } else {
          cy.wrap($button).click();
        }
      });
    });
  });

  it('sorts N/A in last seen correctly', () => {
    cy.get(TABLE)
      .find('td[data-key=2]')
      .children()
      .eq(0)
      .should('have.text', 'N/A');
    cy.get('.pf-c-table__sort').eq(1).click();
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
    cy.get(TABLE).find('#name-filter').type('foobar');
    view.chips().should('not.exist');
  });

  it('renders no clusters message', () => {
    cy.get('#empty-state-message')
      .find('h4')
      .should('have.text', 'No clusters');
  });

  it('renders table header', () => {
    cy.get(TABLE).find('th').children().eq(0).should('have.text', 'Name');
    cy.get(TABLE).find('th').children().eq(1).should('have.text', 'Last seen');
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
    cy.get(TABLE).find('#name-filter').type('foobar');
    view.chips().should('not.exist');
  });

  it('renders error message', () => {
    cy.get('#error-state-message')
      .find('h4')
      .should('have.text', 'Something went wrong');
  });

  it('renders table header', () => {
    cy.get(TABLE).find('th').children().eq(0).should('have.text', 'Name');
    cy.get(TABLE).find('th').children().eq(1).should('have.text', 'Last seen');
  });
});
