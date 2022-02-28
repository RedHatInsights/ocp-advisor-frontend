import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import _ from 'lodash';

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
  DROPDOWN_TOGGLE,
  DROPDOWN_ITEM
} from '../../../cypress/utils/components';
import {
  DEFAULT_ROW_COUNT,
  PAGINATION_VALUES,
} from '../../../cypress/utils/defaults';

// selectors
const TABLE = 'div[id=affected-list-table]';
const BULK_SELECT = '[data-ouia-component-id="clusters-selector"]';
const SEARCH_ITEMS = ['ff', 'CUSTOM', 'Foobar', 'Not existing cluster'];
const TABLE_HEADERS = ['Name', 'Last seen'];

function filterData(text = '') {
  // FIXME: is this the right way to use loadash?
  return _.filter(data['enabled'], (it) =>
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
    expect(_.map(SEARCH_ITEMS, (it) => it.toLowerCase())).to.include('foobar');
  });
  it('has none enabled clusters with "Not existing cluster" in name', () => {
    cy.wrap(filterData('Not existing cluster'))
      .its('length')
      .should('be.eq', 0);
    expect(_.map(SEARCH_ITEMS, (it) => it.toLowerCase())).to.include(
      'not existing cluster'
    );
  });
  it('has at least one entry with N/A time', () => {
    cy.wrap(_.filter(data['enabled'], (it) => it['last_checked_at'] === ''))
      .its('length')
      .should('be.gte', 1);
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
    cy.get(TABLE).within(() => {
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

  it(`pagination default is set to ${DEFAULT_ROW_COUNT}`, () => {
    cy.get('.pf-c-options-menu__toggle-text')
      .find('b')
      .eq(0)
      .should('have.text', '1 - 20');
  });


  it('bulk disabling is disabled by default', () => {
    cy.get(TOOLBAR)
      .find('.pf-m-spacer-sm')
      .find(DROPDOWN)
      .within((el) => {
        cy.wrap(el).click();
        cy.get('button')
          .contains('Disable recommendation for selected clusters')
          .should('have.class', 'pf-m-disabled');
      });
    cy.get(BULK_SELECT).find('input').should('not.be.checked');
  });

  it('bulk selector checkbox can be clicked', () => {
    cy.get(BULK_SELECT).find('input').click().should('be.checked');
    // contains right text
    cy.get(BULK_SELECT)
      .find('label.pf-c-dropdown__toggle-check')
      .contains(`${data['enabled'].length} selected`);
    // checks all rows
    cy.get(TABLE)
      .find('tbody[role=rowgroup]')
      .find(ROW)
      .each((row) => {
        cy.wrap(row).find('td').first().find('input').should('be.checked');
      });
    // bulk disabling button is enabled
    cy.get(TOOLBAR)
      .find('.pf-m-spacer-sm')
      .find(DROPDOWN)
      .within((el) => {
        cy.wrap(el).click();
        cy.get('button')
          .contains('Disable recommendation for selected clusters')
          .should('not.have.class', 'pf-m-disabled');
      });
  });

  it('bulk selector checkbox is unselected when a row is unselected', () => {
    cy.get(BULK_SELECT).find('input').click().should('be.checked');
    // removing one row unselects it
    cy.get(TABLE)
      .find('tbody[role=rowgroup]')
      .find(ROW)
      .first()
      .find('td')
      .first()
      .find('input')
      .click();
    cy.get(BULK_SELECT).find('input').should('not.be.checked');
    cy.get(BULK_SELECT)
      .find('label.pf-c-dropdown__toggle-check')
      .contains(`${data['enabled'].length - 1} selected`);
    // bulk disabling button is still enabled
    cy.get(TOOLBAR)
      .find('.pf-m-spacer-sm')
      .find(DROPDOWN)
      .within((el) => {
        cy.wrap(el).click();
        cy.get('button')
          .contains('Disable recommendation for selected clusters')
          .should('not.have.class', 'pf-m-disabled');
      });
  });

  it('bulk selector checkbox unchecking removes all checks from rows', () => {
    cy.get(BULK_SELECT).find('input').click().should('be.checked');

    cy.get(BULK_SELECT).find('input').click();
    cy.get(BULK_SELECT)
      .find('label.pf-c-dropdown__toggle-check')
      .contains('selected')
      .should('not.exist');
    cy.get(TABLE)
      .find('tbody[role=rowgroup]')
      .find(ROW)
      .each((row) => {
        cy.wrap(row).find('td').first().find('input').should('not.be.checked');
      });
  });

  it('bulk selector is updated when checking one row', () => {
    cy.get(BULK_SELECT).find('input').should('not.be.checked');

    // selecting from rows display the correct text
    cy.get(TABLE)
      .find('tbody[role=rowgroup]')
      .find(ROW)
      .first()
      .find('td')
      .first()
      .find('input')
      .click();

    cy.get(BULK_SELECT).find('input').should('not.be.checked');

    cy.get(BULK_SELECT)
      .find('label.pf-c-dropdown__toggle-check')
      .contains(`1 selected`);
  });

  it('bulk selector has buttons to select none or all', () => {
    cy.get(BULK_SELECT).find('button').click();
    cy.get(BULK_SELECT)
      .find('ul li')
      .should(($lis) => {
        expect($lis).to.have.length(2);
        expect($lis.eq(0)).to.contain('0');
        expect($lis.eq(1)).to.contain(`${data['enabled'].length}`);
      });
  });

  it('bulk selector button can select all', () => {
    cy.get(BULK_SELECT).find('button').click();
    cy.get(BULK_SELECT).find('ul li').contains('all').click();

    cy.get(BULK_SELECT).find('input').should('be.checked');
    // contains right text
    cy.get(BULK_SELECT)
      .find('label.pf-c-dropdown__toggle-check')
      .contains(`${data['enabled'].length} selected`);
    // checks all rows
    cy.get(TABLE)
      .find('tbody[role=rowgroup]')
      .find(ROW)
      .each((row) => {
        cy.wrap(row).find('td').first().find('input').should('be.checked');
      });
    // bulk disabling button is enabled
    cy.get(TOOLBAR)
      .find('.pf-m-spacer-sm')
      .find(DROPDOWN)
      .within((el) => {
        cy.wrap(el).click();
        cy.get('button')
          .contains('Disable recommendation for selected clusters')
          .should('not.have.class', 'pf-m-disabled');
      });
  });

  it('bulk selector button can select none', () => {
    cy.get(BULK_SELECT).find('input').click();
    cy.get(BULK_SELECT).find('button').click();
    cy.get(BULK_SELECT).find('ul li').contains('none').click();

    cy.get(BULK_SELECT).find('input').should('not.be.checked');
    // checks all rows
    cy.get(TABLE)
      .find('tbody[role=rowgroup]')
      .find(ROW)
      .each((row) => {
        cy.wrap(row).find('td').first().find('input').should('not.be.checked');
      });
    // bulk disabling button is enabled
    cy.get(TOOLBAR)
      .find('.pf-m-spacer-sm')
      .find(DROPDOWN)
      .within((el) => {
        cy.wrap(el).click();
        cy.get('button')
          .contains('Disable recommendation for selected clusters')
          .should('have.class', 'pf-m-disabled');
      });
  });

  it('pagination defaults are expected ones', () => {
    cy.get(TOOLBAR)
      .find(PAGINATION_MENU)
      .find(DROPDOWN_TOGGLE)
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
        .find(DROPDOWN_TOGGLE)
        .click();
      cy.get(TOOLBAR)
        .find(PAGINATION_MENU)
        .find('ul[class=pf-c-options-menu__menu]')
        .find(DROPDOWN_ITEM)
        .contains(`${el}`)
        .click({ force: true }); // caused by the css issue
      checkRowCounts(Math.min(el, filterData().length));
    });
  });

  it('no chips are displayed by default', () => {
    cy.get(CHIP_GROUP).should('not.exist');
    cy.get('button').contains('Clear filters').should('not.exist');
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
      cy.get('button').contains('Clear filters').should('exist');
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

  // TODO remove: the test is not stable for changes in data
  it('sorting the last seen column', () => {
    cy.get(TABLE)
      .find('td[data-key=1]')
      .children()
      .eq(0)
      .should('have.text', '694d3942-9cb7-42b8-aad2-1f28cc7f0a3b');
  });

  // TODO remove: the test is not stable for changes in data
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

  // TODO fix test: double sorting? keep ordering in single sorting?
  Object.entries({
    name: 'Name',
    last_checked_at: 'Last seen',
  }).forEach(([category, label]) => {
    ['ascending', 'descending'].forEach((order) => {
      it(`sort ${order} by ${label}`, () => {
        const col = `td[data-label="${label}"]`;
        const header = `th[data-label="${label}"]`;

        cy.get(col).should(
          'have.length',
          Math.min(DEFAULT_ROW_COUNT, data['enabled'].length)
        );
        if (category !== 'name') {
          // sort first by name to ensure consistent ordering
          cy.get(`th[data-label="Name"]`).find('button').click();
        }
        cy.get(header).find('button').click();
        // FIXME right way to do the second click?
        if (order === 'descending') {
          // click a second time to reverse sorting
          cy.get(header).find('button').click();
        }

        // add property name to clusters
        let sortedClusters = _.cloneDeep(data['enabled']);
        sortedClusters.forEach(
          (it) =>
            (it['name'] = it['cluster_name']
              ? it['cluster_name']
              : it['cluster'])
        );
        sortedClusters = _.map(
          _.sortBy(sortedClusters, [category, 'name']),
          'name'
        );
        if (order === 'descending') {
          // reverse order
          sortedClusters = _.reverse(sortedClusters);
        }
        cy.get(`td[data-label="Name"]`)
          .then(($els) => {
            return _.map(Cypress.$.makeArray($els), 'innerText');
          })
          .should(
            'deep.equal',
            sortedClusters.slice(
              0,
              Math.min(DEFAULT_ROW_COUNT, sortedClusters.length)
            )
          );
      });
    });
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

  it('renders table headers', () => {
    cy.get('table th')
      .then(($els) => {
        return _.map(Cypress.$.makeArray($els), 'innerText');
      })
      .should('deep.equal', TABLE_HEADERS);
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
