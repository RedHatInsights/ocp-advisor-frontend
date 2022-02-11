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
import {
  TOOLBAR,
  ROW,
  PAGINATION,
  PAGINATION_MENU,
  CHIP_GROUP,
  DROPDOWN,
  MODAL,
  CHECKBOX,
} from '../../../cypress/utils/components';

// selectors
const TABLE = 'div[id=affected-list-table]';
const BULK_SELECT = '[data-ouia-component-id="clusters-selector"]';
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

function checkRowCounts(n) {
  return cy
    .get('table tbody[role=rowgroup]')
    .find(ROW)
    .should('have.length', n);
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
    cy.get(`div[id=affected-list-table]`).within(() => {
      cy.get(TOOLBAR).should('have.length', 1);
      cy.get('table').should('have.length', 1);
      cy.get('div[data-ouia-component-type="RHI/TableToolbar"]').should(
        'have.length',
        1
      );
    });
  });

  it('shows first twenty clusters', () => {
    checkRowCounts(DEFAULT_ROW_COUNT);
  });

  it('pagination defaults are expected ones', () => {
    cy.get(TOOLBAR)
      .find(PAGINATION_MENU)
      .find('button[data-ouia-component-type="PF4/DropdownToggle"]')
      .click();
    cy.get(TOOLBAR)
      .find(PAGINATION_MENU)
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
      cy.get(TOOLBAR)
        .find(PAGINATION_MENU)
        .find('button[data-ouia-component-type="PF4/DropdownToggle"]')
        .click();
      cy.get(TOOLBAR)
        .find(PAGINATION_MENU)
        .find('ul[class=pf-c-options-menu__menu]')
        .find('[data-ouia-component-type="PF4/DropdownItem"]')
        .contains(`${el}`)
        .click({ force: true }); // caused by the css issue
      checkRowCounts(Math.min(el, filterData().length));
    });
  });

  // outer loop required to clean up filter bar
  SEARCH_ITEMS.forEach((el) => {
    it(`can add name filter (${el})`, () => {
      cy.get(TABLE).find('#name-filter').type(el);
      // renders filter chips
      cy.get(TOOLBAR)
        .find(CHIP_GROUP)
        .should('contain', 'Name')
        .and('contain', el);
      // check matched clusters
      cy.wrap(filterData(el)).then((data) => {
        if (data.length === 0) {
          cy.get('table .pf-c-empty-state')
            .should('contain', 'No matching clusters found')
            .and(
              'contain',
              'To continue, edit your filter settings and search again.'
            );
        } else {
          checkRowCounts(Math.min(DEFAULT_ROW_COUNT, data.length));
        }
      });
    });
  });

  it('can clear filters', () => {
    cy.get(TABLE).find('#name-filter').type('custom');
    cy.get(TOOLBAR).find('button').contains('Clear filters').click();
    cy.get(TOOLBAR).find(CHIP_GROUP).should('not.exist');
    checkRowCounts(Math.min(DEFAULT_ROW_COUNT, filterData().length));
  });

  it('display name is rendered instead of cluster uuid', () => {
    cy.get('table tbody[role=rowgroup]')
      .find(ROW)
      .contains('custom cluster name 2')
      .should('have.attr', 'href')
      .and('contain', '/clusters/f7331e9a-2f59-484d-af52-338d56165df5');
  });

  it('renders table header', () => {
    cy.get(TABLE).find('th').children().eq(0).should('have.text', 'Name');
    cy.get(TABLE).find('th').children().eq(1).should('have.text', 'Last seen');
  });

  it('can select/deselect all', () => {
    cy.get(TOOLBAR).within(() => {
      cy.get(
        '[data-ouia-component-id="clusters-selector-toggle-checkbox"]'
      ).click();
      cy.get('#toggle-checkbox-text').should(
        'have.text',
        `${filterData().length} selected`
      );
      cy.get('.pf-c-dropdown__toggle').find('button').click();
      cy.get('ul[class=pf-c-dropdown__menu]')
        .find('li')
        .eq(1)
        .click({ force: true });
      cy.get('#toggle-checkbox-text').should('not.exist');
    });
  });

  it('can disable selected clusters', () => {
    cy.get(TOOLBAR)
      .find('[data-ouia-component-id="clusters-selector-toggle-checkbox"]')
      .click();
    cy.get(TOOLBAR).find('button[aria-label=Actions]').click();
    cy.get('.pf-c-dropdown__menu')
      .find('li')
      .find('button')
      .click({ force: true });
    cy.get('.pf-c-modal-box')
      .find('.pf-c-check label')
      .should('have.text', 'Disable recommendation for selected clusters');
  });

  it('can disable one cluster', () => {
    cy.get('table tbody[role=rowgroup]')
      .find(ROW)
      .eq(0)
      .find('.pf-c-table__action button')
      .click({ force: true });
    cy.get('table tbody[role=rowgroup]')
      .find(ROW)
      .eq(0)
      .find('.pf-c-dropdown__menu button')
      .click({ force: true });
    cy.get('.pf-c-modal-box')
      .find('.pf-c-check label')
      .should('have.text', 'Disable only for this cluster');
  });

  it('can iterate over pages', () => {
    cy.wrap(itemsPerPage()).each((el, index, list) => {
      checkRowCounts(el);
      cy.get(TOOLBAR)
        .find(PAGINATION)
        .find('button[data-action="next"]')
        .then(($button) => {
          if (index === list.length - 1) {
            cy.wrap($button).should('be.disabled');
          } else {
            cy.wrap($button).click();
          }
        });
    });
  });

  it('sorting the last seen column', () => {
    cy.get(TABLE)
      .find('td[data-key=1]')
      .children()
      .eq(0)
      .should('have.text', '694d3942-9cb7-42b8-aad2-1f28cc7f0a3b');
  });

  it('sorts N/A in last seen correctly', () => {
    cy.get(TABLE);
    cy.get('.pf-c-table__sort').eq(1).click();
    cy.get(TABLE)
      .find('td[data-key=1]')
      .children()
      .eq(0)
      .should('have.text', 'foobar cluster');
    cy.get('.pf-c-table__sort').eq(1).click();
    cy.get(TABLE)
      .find('td[data-key=1]')
      .children()
      .eq(0)
      .should('have.text', 'dd2ef343-9131-46f5-8962-290fdfdf2199');
  });

  it('modal for bulk disabling', () => {
    cy.get(BULK_SELECT).find('input').click().should('be.checked');

    cy.get(TOOLBAR)
      .find('.pf-m-spacer-sm')
      .find(DROPDOWN)
      .within((el) => {
        cy.wrap(el).click();
        cy.get('button')
          .contains('Disable recommendation for selected clusters')
          .click();
      });

    cy.get(MODAL).find(CHECKBOX).should('be.checked');

    // TODO check that request is send with the expect amount of clusters

    // TODO check page is reloaded afterwards
  });

  it('modal cancel does not trigger anything', () => {
    cy.get(BULK_SELECT).find('input').click().should('be.checked');

    cy.get(TOOLBAR)
      .find('.pf-m-spacer-sm')
      .find(DROPDOWN)
      .within((el) => {
        cy.wrap(el).click();
        cy.get('button')
          .contains('Disable recommendation for selected clusters')
          .click();
      });

    cy.get(MODAL).find('button').contains('Cancel').click();

    // TODO check that request is send with the expect amount of clusters

    // TODO check page is reloaded afterwards
  });

  it('modal for cluster disabling', () => {
    cy.get(TABLE)
      .find('tbody[role=rowgroup]')
      .find(ROW)
      .first()
      .find('td')
      .eq(3)
      .click()
      .contains('Disable')
      .click();

    cy.get(MODAL).find(CHECKBOX).should('be.checked');

    // TODO check that request includes one cluster

    // TODO check page is reloaded afterwards
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
    cy.get(TOOLBAR).find(CHIP_GROUP).should('not.exist');
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
    cy.get(TOOLBAR).find(CHIP_GROUP).should('not.exist');
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
