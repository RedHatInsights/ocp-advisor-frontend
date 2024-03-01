import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import _ from 'lodash';

import { AffectedClustersTable } from './AffectedClustersTable';
import clusterDetailData from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule/external.rules.rule|ERROR_KEY/clusters_detail.json';
import { Intl } from '../../Utilities/intlHelper';
import getStore from '../../Store';

/* eslint-disable camelcase */
import {
  TOOLBAR,
  PAGINATION,
  CHIP_GROUP,
  MODAL_CONTENT,
  CHECKBOX,
  TABLE,
  TABLE_ROW,
  checkTableHeaders,
  checkRowCounts,
  tableIsSortedBy,
  checkEmptyState,
  itemsPerPage,
  checkPaginationTotal,
  checkPaginationValues,
  changePagination,
  MENU_TOGGLE,
  MENU_TOGGLE_TEXT,
  MENU_ITEM,
  DROPDOWN_ITEM,
} from '@redhat-cloud-services/frontend-components-utilities';

import {
  DEFAULT_ROW_COUNT,
  PAGINATION_VALUES,
} from '../../../cypress/utils/defaults';
import { SORTING_ORDERS } from '../../../cypress/utils/globals';
import {
  checkNoMatchingClusters,
  checkFiltering,
  checkSorting,
} from '../../../cypress/utils/table';
import {
  checkPaginationSelected,
  checkCurrentPage,
} from '../../../cypress/utils/pagination';
import rule from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule/external.rules.rule|ERROR_KEY.json';
import { AFFECTED_CLUSTERS_COLUMNS } from '../../AppConstants';
import {
  VERSION_COMBINATIONS,
  filter,
  applyFilters,
  removeAllChips,
} from '../../../cypress/utils/filters';

// selectors
const ROOT = 'div[id=affected-list-table]';
const BULK_SELECT = 'clusters-selector';
const SEARCH_ITEMS = ['ff', 'CUSTOM', 'Foobar', 'Not existing cluster'];
const TABLE_HEADERS = _.map(AFFECTED_CLUSTERS_COLUMNS, (it) => it.title);

let values = _.cloneDeep(clusterDetailData.data['enabled']);
values.forEach(
  (it) => (it['name'] = it['cluster_name'] ? it['cluster_name'] : it['cluster'])
);
const dataUnsorted = _.cloneDeep(values);
// default sorting
const data = _.orderBy(values, ['last_checked_at'], ['desc']);

const filtersConf = {
  name: {
    selectorText: 'Name',
    values: SEARCH_ITEMS,
    type: 'input',
    filterFunc: (it, value) =>
      it.name.toLowerCase().includes(value.toLowerCase()),
  },
  version: {
    selectorText: 'Version',
    values: VERSION_COMBINATIONS,
    type: 'checkbox',
    filterFunc: (it, value) => value.includes(it.meta.cluster_version),
  },
};

const filterData = (filters) => filter(filtersConf, data, filters);
const filterApply = (filters) => applyFilters(filters, filtersConf);

const filterCombos = [{ name: 'foobar', version: ['4.18.12', '4.17.9'] }];

describe('test data', () => {
  it('has enabled clusters', () => {
    expect(data).to.have.length.gte(1);
  });
  it('has more enabled clusters than default rows', () => {
    expect(data).to.have.length.gt(DEFAULT_ROW_COUNT);
  });
  it('has less data than 101', () => {
    expect(data).to.have.length.lte(PAGINATION_VALUES[3]);
  });
  it('has more than one enabled clusters with "custom" in name', () => {
    expect(filterData({ name: 'custom' })).to.have.length.gt(1);
  });
  it('"foobar" is in the list of names to search and thre is at least one enabled cluster matching', () => {
    expect(filterData({ name: 'foobar' })).to.have.lengthOf(1);
    expect(_.map(SEARCH_ITEMS, (it) => it.toLowerCase())).to.include('foobar');
  });
  it('"Not existing cluster" is in the list of names to search and there are no enabled clusters matching it', () => {
    expect(filterData({ name: 'Not existing cluster' })).to.have.lengthOf(0);
    expect(_.map(SEARCH_ITEMS, (it) => it.toLowerCase())).to.include(
      'not existing cluster'
    );
  });
  _.uniq(_.flatten(VERSION_COMBINATIONS)).map((c) =>
    it(`has at least one cluster with version ${c}`, () => {
      expect(filterData({ version: [c] })).to.have.length.gte(1);
    })
  );
  it(`has at least one cluster without a version`, () => {
    expect(filterData({ version: [''] })).to.have.length.gte(1);
  });
  it('has at least one enabled cluster with missing impacted date', () => {
    expect(values.filter((v) => v['impacted'] === undefined).length).to.be.gte(
      1
    );
  });
  it('has at least one enabled cluster with empty impacted date', () => {
    expect(values.filter((v) => v['impacted'] === '').length).to.be.gte(1);
  });
});

// TODO: when checking empty state, also check toolbar available and not disabled

describe('non-empty successful affected clusters table', () => {
  beforeEach(() => {
    cy.mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <AffectedClustersTable
              query={{
                isError: false,
                isFetching: false,
                isUninitialized: false,
                isSuccess: true,
                data: clusterDetailData.data,
              }}
              rule={rule.content}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('renders table', () => {
    cy.get(ROOT).within(() => {
      cy.get(TOOLBAR).should('have.length', 1);
      cy.get(TABLE).should('have.length', 1);
    });
  });

  it('renders table header', () => {
    checkTableHeaders(TABLE_HEADERS);
  });

  it('rows show cluster names instead uuids when available', () => {
    const names = _.map(data, 'name');
    // Wait for skeleton to disappear
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
    cy.get(`td[data-label="Name"]`)
      .then(($els) => {
        return _.map(Cypress.$.makeArray($els), 'innerText');
      })
      .should('deep.equal', names.slice(0, DEFAULT_ROW_COUNT));
  });

  it('names of rows are links', () => {
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
    cy.get(TABLE)
      .find(TABLE_ROW)
      .each(($el, index) => {
        cy.wrap($el)
          .find('td[data-label=Name]')
          .find(`a[href*="/clusters/${data[index]['cluster']}"]`)
          .should('have.text', data[index]['name']);
      });
  });

  describe('defaults', () => {
    it(`shows ${DEFAULT_ROW_COUNT} clusters only`, () => {
      checkRowCounts(DEFAULT_ROW_COUNT);
    });

    it(`pagination is set to ${DEFAULT_ROW_COUNT}`, () => {
      cy.get(MENU_TOGGLE_TEXT)
        .find('b')
        .eq(0)
        .should('have.text', `1 - ${DEFAULT_ROW_COUNT}`);
    });

    it('bulk selection is disabled', () => {
      cy.get(TOOLBAR).find('.pf-m-spacer-sm').find(MENU_TOGGLE).click();
      cy.get('.pf-m-spacer-sm')
        .find(MENU_ITEM)
        .should('have.class', 'pf-m-disabled')
        .contains('Disable recommendation for selected clusters');
      cy.get(`[aria-label=${BULK_SELECT}]`)
        .find('input')
        .should('not.be.checked');
    });

    it('sorting using last seen', () => {
      tableIsSortedBy('Last seen');
    });
  });

  describe('bulk selector', () => {
    it('checkbox can be clicked', () => {
      cy.ouiaId(BULK_SELECT, 'input').click().should('be.checked');
      // contains right text
      cy.get(TOOLBAR)
        .find('.pf-v5-c-check__label')
        .contains(`${filterData({}).length} selected`);
      // checks all rows
      cy.get(TABLE)
        .find(TABLE_ROW)
        .each((row) => {
          cy.wrap(row).find('td').first().find('input').should('be.checked');
        });
      // bulk disabling button is enabled
      cy.get(TOOLBAR).find('.pf-m-spacer-sm').find(MENU_TOGGLE).click();
      cy.get('.pf-m-spacer-sm .pf-v5-c-menu__list-item')
        .should('not.have.class', 'pf-m-disabled')
        .contains('Disable recommendation for selected clusters');
      // modal is opened
      cy.get(DROPDOWN_ITEM).should('have.length', 1);
    });

    it('checkbox can be un-clicked and all row are unselected', () => {
      cy.ouiaId(BULK_SELECT, 'input').dblclick().should('not.be.checked');
      // contains right text
      cy.get('#toggle-checkbox-text').should('not.exist');
      // checks all rows
      cy.get(TABLE)
        .find(TABLE_ROW)
        .each((row) => {
          cy.wrap(row)
            .find('td')
            .first()
            .find('input')
            .should('not.be.checked');
        });
      // bulk disabling button is not enabled
      cy.get(TOOLBAR).find('.pf-m-spacer-sm').find(MENU_TOGGLE).click();
      cy.get(TOOLBAR)
        .find('.pf-m-spacer-sm')
        .get(MENU_ITEM)
        .should('have.class', 'pf-m-disabled')
        .contains('Disable recommendation for selected clusters');
      // modal is opened
      cy.get(DROPDOWN_ITEM).should('have.length', 1);
    });

    it('checkbox is unselected when a row is unselected', () => {
      cy.ouiaId(BULK_SELECT, 'input').click().should('be.checked');
      cy.get('[aria-label=clusters-selector]').click();
      // cy.ouiaId(BULK_SELECT).find('input').click().should('be.checked');
      // removing one row unselects it
      cy.get(TABLE)
        .find(TABLE_ROW)
        .first()
        .find('td')
        .first()
        .find('input')
        .click();
      cy.ouiaId(BULK_SELECT, 'input').should('not.be.checked');
      cy.get(`[aria-label=${BULK_SELECT}]`)
        .find('.pf-v5-c-check__label')
        .contains(`${data.length - 1} selected`);
      // bulk disabling button is still enabled
      cy.get(TOOLBAR)
        .find('.pf-m-spacer-sm')
        .find('.pf-v5-c-menu-toggle')
        .click();
      cy.get('.pf-m-spacer-sm .pf-v5-c-menu__list-item')
        .should('not.have.class', 'pf-m-disabled')
        .contains('Disable recommendation for selected clusters');
    });

    it('is updated when checking one row', () => {
      cy.ouiaId(BULK_SELECT, 'input').should('not.be.checked');

      // selecting from rows display the correct text
      cy.get(TABLE)
        .find(TABLE_ROW)
        .first()
        .find('td')
        .first()
        .find('input')
        .click();

      cy.ouiaId(BULK_SELECT, 'input').should('not.be.checked');

      cy.get(`[aria-label=${BULK_SELECT}]`)
        .find('.pf-v5-c-check__label')
        .contains(`1 selected`);
    });

    it('has buttons to select none or all', () => {
      cy.get(`[aria-label=${BULK_SELECT}]`).click();
      cy.ouiaId(BULK_SELECT)
        .find('ul li')
        .should(($lis) => {
          expect($lis).to.have.length(2);
          expect($lis.eq(0)).to.contain('0');
          expect($lis.eq(1)).to.contain(`${data.length}`);
        });
    });

    it('button can select all', () => {
      cy.get(`[aria-label=${BULK_SELECT}]`).click();
      // cy.ouiaId(BULK_SELECT).find('button').click();
      cy.ouiaId(BULK_SELECT).find('ul li').contains('all').click();

      cy.get(`[aria-label=${BULK_SELECT}]`).find('input').should('be.checked');
      // contains right text
      cy.get(`[aria-label=${BULK_SELECT}]`)
        .find('.pf-v5-c-check__label')
        .contains(`${data.length} selected`);
      // checks all rows
      cy.get(TABLE)
        .find(TABLE_ROW)
        .each((row) => {
          cy.wrap(row).find('td').first().find('input').should('be.checked');
        });
      // bulk disabling button is enabled
      cy.get(TOOLBAR)
        .find('.pf-m-spacer-sm')
        .find('.pf-v5-c-menu-toggle')
        .click();
      cy.get('.pf-m-spacer-sm .pf-v5-c-menu__list-item')
        .should('not.have.class', 'pf-m-disabled')
        .contains('Disable recommendation for selected clusters');
    });

    it('button can select none', () => {
      cy.get(`[aria-label=${BULK_SELECT}]`).find('input').click();
      cy.ouiaId(BULK_SELECT).find('ul li').contains('none').click();

      cy.get(`[aria-label=${BULK_SELECT}]`)
        .find('input')
        .should('not.be.checked');
      // checks all rows
      cy.get(TABLE)
        .find(TABLE_ROW)
        .each((row) => {
          cy.wrap(row)
            .find('td')
            .first()
            .find('input')
            .should('not.be.checked');
        });
      // bulk disabling button is enabled
      cy.get(TOOLBAR)
        .find('.pf-m-spacer-sm')
        .find('.pf-v5-c-menu-toggle')
        .click();
      cy.get('.pf-m-spacer-sm .pf-v5-c-menu__list-item')
        .should('have.class', 'pf-m-disabled')
        .contains('Disable recommendation for selected clusters');
      cy.get(`[aria-label=${BULK_SELECT}]`)
        .find('.pf-v5-c-check__label')
        .should('not.exist');
    });

    it('text is updated according to the number of rows selected', () => {
      let nSelectedRows = 0;
      // select some rows
      cy.get(TABLE)
        .find(TABLE_ROW)
        .each((row, index) => {
          if (index % 2 == 0 && index < DEFAULT_ROW_COUNT) {
            cy.wrap(row).find('td').first().find('input').click();
            nSelectedRows += 1;
          }
        })
        .then(() => {
          cy.get(`[aria-label=${BULK_SELECT}]`)
            .find('.pf-v5-c-check__label')
            .contains(`${nSelectedRows} selected`);
        });
    });
  });

  describe('pagination', () => {
    it('shows correct total number of clusters', () => {
      checkPaginationTotal(data.length);
    });

    it('values are expected ones', () => {
      checkPaginationValues(PAGINATION_VALUES);
    });

    it('can change limit', () => {
      // FIXME: best way to make the loop
      cy.wrap(PAGINATION_VALUES).each((el) => {
        changePagination(el);
        checkRowCounts(Math.min(el, filterData({}).length));
      });
    });

    it('can iterate over pages', () => {
      cy.wrap(itemsPerPage(filterData({}).length, DEFAULT_ROW_COUNT)).each(
        (el, index, list) => {
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
        }
      );
    });
  });

  describe('sorting', () => {
    _.zip(
      ['name', 'meta.cluster_version', 'last_checked_at', 'impacted'],
      TABLE_HEADERS
    ).forEach(([category, label]) => {
      SORTING_ORDERS.forEach((order) => {
        it(`${order} by ${label}`, () => {
          let sortingParameter = category;
          // modify sortingParameters for certain values
          if (category === 'name') {
            // name sorting is case insensitive
            sortingParameter = (it) => it.name.toLowerCase();
          } else if (category === 'last_checked_at') {
            sortingParameter = (it) =>
              it.last_checked_at || '1970-01-01T01:00:00.001Z';
          } else if (category === 'impacted') {
            sortingParameter = (it) =>
              it.impacted || '1970-01-01T01:00:00.001Z';
          } else if (category == 'meta.cluster_version') {
            sortingParameter = (it) =>
              (it.meta.cluster_version || '0.0.0')
                .split('.')
                .map((n) => parseInt(n) + 100000) // add padding
                .join('.');
          }

          checkSorting(
            dataUnsorted,
            sortingParameter,
            label,
            order,
            'Name',
            'name',
            Math.min(DEFAULT_ROW_COUNT, dataUnsorted.length),
            null
          );
        });
      });
    });
  });

  describe('filtering', () => {
    it('no chips are displayed by default', () => {
      cy.get(CHIP_GROUP).should('not.exist');
      cy.get('button').contains('Reset filters').should('not.exist');
    });

    describe('single filter', () => {
      Object.entries(filtersConf).forEach(([k, v]) => {
        v.values.forEach((filterValues) => {
          it(`${k}: ${filterValues}`, () => {
            const filters = { [k]: filterValues };
            checkFiltering(
              filters,
              filtersConf,
              _.map(filterData(filters), 'name').slice(0, DEFAULT_ROW_COUNT),
              'Name',
              TABLE_HEADERS,
              'No matching clusters found',
              false,
              false
            );
          });
        });
      });
    });

    describe('combined filters', () => {
      filterCombos.forEach((filters) => {
        it(`${Object.keys(filters)}`, () => {
          checkFiltering(
            filters,
            filtersConf,
            _.map(filterData(filters), 'name').slice(0, DEFAULT_ROW_COUNT),
            'Name',
            TABLE_HEADERS,
            'No matching clusters found',
            false,
            false
          );
        });
      });
    });

    it('can Reset filters', () => {
      filterApply({ name: 'Not existing cluster' });
      cy.get(TOOLBAR).find('button').contains('Reset filters').click();
      cy.get(TOOLBAR).find(CHIP_GROUP).should('not.exist');
      checkRowCounts(Math.min(DEFAULT_ROW_COUNT, filterData({}).length));
    });

    it('will reset filters but not pagination and sorting', () => {
      filterApply({ name: 'a' });
      changePagination(PAGINATION_VALUES[0]);
      cy.get(TOOLBAR)
        .find(PAGINATION)
        .find('button[data-action="next"]')
        .then(($button) => {
          cy.wrap($button).click();
        });

      cy.get('th[data-label="Name"]').find('button').click();
      cy.get(TOOLBAR).find('button').contains('Reset filters').click();
      cy.get(TOOLBAR).find(CHIP_GROUP).should('not.exist');
      checkPaginationSelected(0);
      checkCurrentPage(1);
      cy.get('th[data-label="Name"]')
        .should('have.attr', 'aria-sort')
        .and('contain', 'ascending');
    });

    it('empty state is displayed when filters do not match any rule', () => {
      filterApply({ name: 'Not existing cluster' });
      checkNoMatchingClusters();
      checkTableHeaders(TABLE_HEADERS);
    });
  });

  it('can disable one cluster', () => {
    cy.get(TABLE)
      .find(TABLE_ROW)
      .eq(0)
      .find('.pf-v5-c-table__action button')
      .click();
    cy.get(TABLE).find(TABLE_ROW).eq(0).find('.pf-v5-c-menu__item').click();
    cy.get(MODAL_CONTENT).should('have.length', 1);
  });

  describe('modal for bulk disabling', () => {
    beforeEach(() => {
      cy.intercept(
        'PUT',
        '/api/insights-results-aggregator/v1/clusters/**/rules/**/error_key/**/disable',
        {
          statusCode: 200,
        }
      ).as('disableRequest');
      cy.intercept(
        'POST',
        '/api/insights-results-aggregator/v1/clusters/**/rules/**/error_key/**/disable_feedback',
        {
          statusCode: 200,
        }
      ).as('disableFeedbackRequest');
    });

    it('modal for cluster disabling', () => {
      cy.get(TABLE)
        .find(TABLE_ROW)
        .first()
        .find('td')
        .eq(AFFECTED_CLUSTERS_COLUMNS.length + 1)
        .click()
        .contains('Disable')
        .click();

      cy.get(MODAL_CONTENT)
        .find('.pf-v5-c-check label')
        .should('have.text', 'Disable only for this cluster');

      cy.get(MODAL_CONTENT).find(CHECKBOX).should('be.checked');

      cy.get(MODAL_CONTENT)
        .find('button[data-ouia-component-id="confirm"]')
        .click();
      // Should catch at one PUT and at one POST requests after clusters rule disable
      cy.wait('@disableRequest');
      cy.wait('@disableFeedbackRequest');
      // TODO check page is reloaded afterwards
    });
  });

  it('missing impacted date shown as Not available', () => {
    filterApply({
      name: values.filter((v) => v['impacted'] === undefined)[0].name,
    });
    cy.get('[data-label="First impacted"]').should('contain', 'Not available');
    removeAllChips();
    filterApply({ name: values.filter((v) => v['impacted'] === '')[0].name });
    cy.get('[data-label="First impacted"]').should('contain', 'Not available');
  });
});

describe('empty successful affected clusters table', () => {
  beforeEach(() => {
    cy.mount(
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
    cy.get('#name-filter').type('foobar');
    cy.get(TOOLBAR).find(CHIP_GROUP).should('not.exist');
  });

  it('renders no clusters message', () => {
    checkEmptyState('No clusters', true);
  });

  it('renders table headers', () => {
    checkTableHeaders(TABLE_HEADERS);
  });
});

describe('empty failed affected clusters table', () => {
  beforeEach(() => {
    cy.mount(
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
    cy.get('#name-filter').type('foobar');
    cy.get(TOOLBAR).find(CHIP_GROUP).should('not.exist');
  });

  it('renders error message', () => {
    checkEmptyState('Something went wrong', true);
  });

  it('renders table header', () => {
    TABLE_HEADERS.map((h, i) =>
      cy.get(TABLE).find('th').eq(i).should('have.text', h)
    );
  });
});
