import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import _ from 'lodash';
import { compare } from 'semver';

import { AffectedClustersTable } from './AffectedClustersTable';
import clusterDetailData from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule/external.rules.rule|ERROR_KEY/clusters_detail.json';
import { Intl } from '../../Utilities/intlHelper';
import getStore from '../../Store';
import {
  TOOLBAR,
  ROW,
  PAGINATION,
  CHIP_GROUP,
  DROPDOWN,
  MODAL,
  CHECKBOX,
  TBODY,
  TABLE,
  CHIP,
} from '../../../cypress/utils/components';
import {
  DEFAULT_ROW_COUNT,
  PAGINATION_VALUES,
} from '../../../cypress/utils/defaults';
import { SORTING_ORDERS } from '../../../cypress/utils/globals';
import {
  checkTableHeaders,
  checkRowCounts,
  tableIsSortedBy,
} from '../../../cypress/utils/table';
import {
  itemsPerPage,
  checkPaginationTotal,
  checkPaginationValues,
  changePagination,
} from '../../../cypress/utils/pagination';
import rule from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule/external.rules.rule|ERROR_KEY.json';
import { AFFECTED_CLUSTERS_COLUMNS } from '../../AppConstants';
import {
  VERSION_COMBINATIONS,
  filter,
  applyFilters,
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
  it('has less data than 51', () => {
    expect(data).to.have.length.lte(PAGINATION_VALUES[2]);
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
      cy.ouiaType('RHI/TableToolbar').should('have.length', 1);
    });
  });

  it('renders table header', () => {
    checkTableHeaders(TABLE_HEADERS);
  });

  it('rows show cluster names instead uuids when available', () => {
    const names = _.map(data, 'name');
    cy.get(`td[data-label="Name"]`)
      .then(($els) => {
        return _.map(Cypress.$.makeArray($els), 'innerText');
      })
      .should('deep.equal', names.slice(0, DEFAULT_ROW_COUNT));
  });

  it('names of rows are links', () => {
    cy.get(TBODY)
      .children()
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
      cy.get('.pf-c-options-menu__toggle-text')
        .find('b')
        .eq(0)
        .should('have.text', '1 - 20');
    });

    it('bulk selection is disabled', () => {
      cy.get(TOOLBAR)
        .find('.pf-m-spacer-sm')
        .find(DROPDOWN)
        .within((el) => {
          cy.wrap(el).click();
          cy.get('button')
            .contains('Disable recommendation for selected clusters')
            .should('have.class', 'pf-m-disabled');
        });
      cy.ouiaId(BULK_SELECT).find('input').should('not.be.checked');
    });

    it('sorting using last seen', () => {
      tableIsSortedBy('Last seen');
    });
  });

  describe('bulk selector', () => {
    it('checkbox can be clicked', () => {
      cy.ouiaId(BULK_SELECT, 'input').click().should('be.checked');
      // contains right text
      cy.get('#toggle-checkbox-text').contains(
        `${filterData({}).length} selected`
      );
      // checks all rows
      cy.get(TABLE)
        .find(TBODY)
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
            .should('not.have.class', 'pf-m-disabled')
            .click();
        });
      // modal is opened
      cy.get(MODAL).should('have.length', 1);
    });

    it('checkbox is unselected when a row is unselected', () => {
      cy.ouiaId(BULK_SELECT).find('input').click().should('be.checked');
      // removing one row unselects it
      cy.get(TABLE)
        .find(TBODY)
        .find(ROW)
        .first()
        .find('td')
        .first()
        .find('input')
        .click();
      cy.ouiaId(BULK_SELECT).find('input').should('not.be.checked');
      cy.ouiaId(BULK_SELECT)
        .find('label.pf-c-dropdown__toggle-check')
        .contains(`${data.length - 1} selected`);
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

    it('checkbox unchecking removes all checks from rows', () => {
      cy.ouiaId(BULK_SELECT).find('input').click().should('be.checked');

      cy.ouiaId(BULK_SELECT).find('input').click();
      cy.ouiaId(BULK_SELECT)
        .find('label.pf-c-dropdown__toggle-check')
        .contains('selected')
        .should('not.exist');
      cy.get(TABLE)
        .find(TBODY)
        .find(ROW)
        .each((row) => {
          cy.wrap(row)
            .find('td')
            .first()
            .find('input')
            .should('not.be.checked');
        });
    });

    it('is updated when checking one row', () => {
      cy.ouiaId(BULK_SELECT).find('input').should('not.be.checked');

      // selecting from rows display the correct text
      cy.get(TABLE)
        .find(TBODY)
        .find(ROW)
        .first()
        .find('td')
        .first()
        .find('input')
        .click();

      cy.ouiaId(BULK_SELECT).find('input').should('not.be.checked');

      cy.ouiaId(BULK_SELECT)
        .find('label.pf-c-dropdown__toggle-check')
        .contains(`1 selected`);
    });

    it('has buttons to select none or all', () => {
      cy.ouiaId(BULK_SELECT).find('button').click();
      cy.ouiaId(BULK_SELECT)
        .find('ul li')
        .should(($lis) => {
          expect($lis).to.have.length(2);
          expect($lis.eq(0)).to.contain('0');
          expect($lis.eq(1)).to.contain(`${data.length}`);
        });
    });

    it('button can select all', () => {
      cy.ouiaId(BULK_SELECT).find('button').click();
      cy.ouiaId(BULK_SELECT).find('ul li').contains('all').click();

      cy.ouiaId(BULK_SELECT).find('input').should('be.checked');
      // contains right text
      cy.ouiaId(BULK_SELECT)
        .find('label.pf-c-dropdown__toggle-check')
        .contains(`${data.length} selected`);
      // checks all rows
      cy.get(TABLE)
        .find(TBODY)
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

    it('button can select none', () => {
      cy.ouiaId(BULK_SELECT).find('input').click();
      cy.ouiaId(BULK_SELECT).find('button').click();
      cy.ouiaId(BULK_SELECT).find('ul li').contains('none').click();

      cy.ouiaId(BULK_SELECT).find('input').should('not.be.checked');
      // checks all rows
      cy.get(TABLE)
        .find(TBODY)
        .find(ROW)
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
        .find(DROPDOWN)
        .within((el) => {
          cy.wrap(el).click();
          cy.get('button')
            .contains('Disable recommendation for selected clusters')
            .should('have.class', 'pf-m-disabled');
        });
      cy.get('#toggle-checkbox-text').should('not.exist');
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
      cy.wrap(itemsPerPage(filterData({}).length)).each((el, index, list) => {
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
  });

  describe('sorting', () => {
    _.zip(
      ['name', 'meta.cluster_version', 'last_checked_at'],
      TABLE_HEADERS
    ).forEach(([category, label]) => {
      SORTING_ORDERS.forEach((order) => {
        it(`${order} by ${label}`, () => {
          const col = `td[data-label="${label}"]`;
          const header = `th[data-label="${label}"]`;

          cy.get(col).should(
            'have.length',
            Math.min(DEFAULT_ROW_COUNT, data.length)
          );
          if (order === 'ascending') {
            cy.get(header).find('button').click();
          } else {
            cy.get(header).find('button').dblclick();
          }

          // add property name to clusters
          let sortedClusters = _.cloneDeep(dataUnsorted);
          // convert N/A timestamps as really old ones
          sortedClusters.forEach((it) => {
            if (it['last_checked_at'] === '') {
              it['last_checked_at'] = '1970-01-01T01:00:00.001Z';
            }
            if (it.meta.cluster_version === '') {
              it.meta.cluster_version = '0.0.0';
            }
          });

          if (category === 'name') {
            // name sorting is case insensitive
            category = (it) => it.name.toLowerCase();
          }

          sortedClusters = _.map(
            category === 'meta.cluster_version'
              ? sortedClusters.sort(
                  (a, b) =>
                    (order === 'ascending' ? 1 : -1) *
                    compare(a.meta.cluster_version, b.meta.cluster_version)
                )
              : _.orderBy(
                  sortedClusters,
                  [category],
                  [order === 'ascending' ? 'asc' : 'desc']
                ),
            'name'
          );
          cy.get(`td[data-label="Name"]`)
            .then(($els) => {
              return _.map(Cypress.$.makeArray($els), 'innerText');
            })
            .should('deep.equal', sortedClusters.slice(0, DEFAULT_ROW_COUNT));
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
            const filters = {};
            filters[k] = filterValues;
            let sortedNames = _.map(filterData(filters), 'name');
            filterApply(filters);
            if (sortedNames.length === 0) {
              // TODO check empty table view
              // TODO headers are displayed
            } else {
              cy.get(`td[data-label="Name"]`)
                .then(($els) => {
                  return _.map(Cypress.$.makeArray($els), 'innerText');
                })
                .should('deep.equal', sortedNames.slice(0, DEFAULT_ROW_COUNT));
            }

            // check chips
            for (const [k, v] of Object.entries(filters)) {
              let groupName = filtersConf[k].selectorText;
              const nExpectedItems =
                filtersConf[k].type === 'checkbox' ? v.length : 1;
              cy.get(CHIP_GROUP)
                .contains(groupName)
                .parents(CHIP_GROUP)
                .then((chipGroup) => {
                  cy.wrap(chipGroup)
                    .find(CHIP)
                    .its('length')
                    .should('be.eq', Math.min(3, nExpectedItems)); // limited to show 3
                });
            }
            cy.get('button').contains('Reset filters').should('exist');
          });
        });
      });
    });

    describe('combined filters', () => {
      filterCombos.forEach((filters) => {
        it(`${Object.keys(filters)}`, () => {
          let sortedNames = _.map(filterData(filters), 'name');
          filterApply(filters);
          if (sortedNames.length === 0) {
            // TODO check empty table view
          } else {
            cy.get(`td[data-label="Name"]`)
              .then(($els) => {
                return _.map(
                  _.map(Cypress.$.makeArray($els), 'innerText'),
                  (it) => it.replace(' \nDisabled', '')
                );
              })
              .should('deep.equal', sortedNames.slice(0, DEFAULT_ROW_COUNT));
          }
          // check chips
          for (const [k, v] of Object.entries(filters)) {
            let groupName = filtersConf[k].selectorText;
            const nExpectedItems =
              filtersConf[k].type === 'checkbox' ? v.length : 1;
            cy.get(CHIP_GROUP)
              .contains(groupName)
              .parents(CHIP_GROUP)
              .then((chipGroup) => {
                cy.wrap(chipGroup)
                  .find(CHIP)
                  .its('length')
                  .should('be.eq', Math.min(3, nExpectedItems)); // limited to show 3
              });
          }
          cy.get('button').contains('Reset filters').should('exist');
        });
      });
    });

    it('can Reset filters', () => {
      cy.get('#name-filter').type('Not existing cluster');
      cy.get(TOOLBAR).find('button').contains('Reset filters').click();
      cy.get(TOOLBAR).find(CHIP_GROUP).should('not.exist');
      checkRowCounts(Math.min(DEFAULT_ROW_COUNT, filterData({}).length));
    });

    it('empty state is displayed when filters do not match any rule', () => {
      cy.get('#name-filter').type('Not existing cluster');
      // TODO check empty table view
      // TODO headers are displayed
    });
  });

  it('can disable one cluster', () => {
    cy.get(TABLE)
      .find(TBODY)
      .find(ROW)
      .eq(0)
      .find('.pf-c-table__action button')
      .click();
    cy.get(TABLE)
      .find(TBODY)
      .find(ROW)
      .eq(0)
      .find('.pf-c-dropdown__menu button')
      .click();
    cy.get(MODAL).should('have.length', 1);
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

    it('modal for bulk disabling', () => {
      cy.ouiaId(BULK_SELECT).find('input').click().should('be.checked');

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

      cy.get(MODAL).find('button[data-ouia-component-id="confirm"]').click();
      // Should catch at least one PUT and at least one POST requests after clusters rule disable
      cy.wait('@disableRequest');
      cy.wait('@disableFeedbackRequest');
      // TODO check page is reloaded afterwards

      // can check the number of request for disable because all occur before @disableFeedbackRequest
      cy.get('@disableRequest.all').its('length').should('equal', data.length);
      // cannot check the number of request because we miss a waiting condition
      // cy.get('@disableFeedbackRequest.all').its('length').should('equal', data.length);
    });

    it('modal cancel does not trigger anything', () => {
      cy.ouiaId(BULK_SELECT).find('input').click().should('be.checked');

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

      // TODO check that request is not send
    });

    it('modal for cluster disabling', () => {
      cy.get(TABLE)
        .find(TBODY)
        .find(ROW)
        .first()
        .find('td')
        .eq(4)
        .click()
        .contains('Disable')
        .click();

      cy.get(MODAL)
        .find('.pf-c-check label')
        .should('have.text', 'Disable only for this cluster');

      cy.get(MODAL).find(CHECKBOX).should('be.checked');

      cy.get(MODAL).find('button[data-ouia-component-id="confirm"]').click();
      // Should catch at one PUT and at one POST requests after clusters rule disable
      cy.wait('@disableRequest');
      cy.wait('@disableFeedbackRequest');
      // TODO check page is reloaded afterwards
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
    cy.get('#name-filter').type('foobar');
    cy.get(TOOLBAR).find(CHIP_GROUP).should('not.exist');
  });

  it('renders no clusters message', () => {
    cy.get('#empty-state-message')
      .find('h4')
      .should('have.text', 'No clusters');
  });

  it('renders table headers', () => {
    checkTableHeaders(TABLE_HEADERS);
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
    cy.get('#name-filter').type('foobar');
    cy.get(TOOLBAR).find(CHIP_GROUP).should('not.exist');
  });

  it('renders error message', () => {
    cy.get('#error-state-message')
      .find('h4')
      .should('have.text', 'Something went wrong');
  });

  it('renders table header', () => {
    TABLE_HEADERS.map((h, i) =>
      cy.get(TABLE).find('th').eq(i).should('have.text', h)
    );
  });
});
