import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import _ from 'lodash';

import { Intl } from '../../Utilities/intlHelper';
import getStore from '../../Store';
import { ClustersListTable } from './ClustersListTable';
import clusters from '../../../cypress/fixtures/api/insights-results-aggregator/v2/clusters.json';
import {
  TOOLBAR,
  PAGINATION,
  CHIP_GROUP,
  TBODY,
  CHIP,
  TABLE,
} from '../../../cypress/utils/components';
import {
  DEFAULT_ROW_COUNT,
  PAGINATION_VALUES,
} from '../../../cypress/utils/defaults';
import { SORTING_ORDERS, TOTAL_RISK } from '../../../cypress/utils/globals';
import { cumulativeCombinations } from '../../../cypress/utils/combine';
import {
  applyFilters,
  filter,
  hasChip,
  removeAllChips,
} from '../../../cypress/utils/filters';
import {
  checkTableHeaders,
  checkRowCounts,
  columnName2UrlParam,
  tableIsSortedBy,
} from '../../../cypress/utils/table';
import { CLUSTERS_LIST_COLUMNS } from '../../AppConstants';
import {
  itemsPerPage,
  checkPaginationTotal,
  checkPaginationValues,
  changePagination,
} from '../../../cypress/utils/pagination';
import { compare } from 'semver';
import { VERSION_COMBINATIONS } from '../../../cypress/utils/filters';

// add property name to clusters
let data = _.cloneDeep(clusters['data']);
data.forEach(
  (it) =>
    (it['name'] = it['cluster_name'] ? it['cluster_name'] : it['cluster_id'])
);
// fill possible missing values
data.forEach((it) => {
  ['1', '2', '3', '4'].forEach((k) => {
    it['hits_by_total_risk'][k] = it['hits_by_total_risk'][k]
      ? it['hits_by_total_risk'][k]
      : 0;
  });
});
// default sorting
let namedClustersDefaultSorting = _.orderBy(
  data,
  [(it) => it.last_checked_at || '1970-01-01T01:00:00.001Z'],
  ['desc']
);

const ROOT = 'div[id=clusters-list-table]';
const TABLE_HEADERS = _.map(CLUSTERS_LIST_COLUMNS, (it) => it.title);

const DEFAULT_DISPLAYED_SIZE = Math.min(data.length, DEFAULT_ROW_COUNT);

// TODO: test pre-filled search parameters filtration

const TOTAL_RISK_VALUES = Object.keys(TOTAL_RISK).concat(['All clusters']);
const TOTAL_RISK_MAP = _.cloneDeep(TOTAL_RISK);
TOTAL_RISK_MAP['All clusters'] = 'all';

const filtersConf = {
  version: {
    selectorText: 'Version',
    values: Array.from(
      cumulativeCombinations(_.uniq(_.flatten(VERSION_COMBINATIONS)))
    ),
    type: 'checkbox',
    filterFunc: (it, value) => {
      return value.includes(it.cluster_version);
    },
    urlParam: 'version',
    urlValue: (it) => encodeURIComponent(String(it)),
  },
  name: {
    selectorText: 'Name',
    values: ['Foo', 'Foo Bar', 'Not existing cluster'],
    type: 'input',
    filterFunc: (it, value) =>
      it.name.toLowerCase().includes(value.toLowerCase()),
    urlParam: 'text',
    urlValue: (it) => it.replace(/ /g, '+'),
  },
  risk: {
    selectorText: 'Total risk',
    values: Array.from(cumulativeCombinations(TOTAL_RISK_VALUES)),
    type: 'checkbox',
    filterFunc: (it, value) => {
      for (const risk of _.map(value, (x) => TOTAL_RISK_MAP[x])) {
        if (risk === 'all' || it.hits_by_total_risk[risk] > 0) return true;
      }
      return false;
    },
    urlParam: 'hits',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => TOTAL_RISK_MAP[x]).join(',')),
  },
};

const DEFAULT_FILTERS = { risk: ['All clusters'] };

// TODO invert parameters and make data optional as well
const filterData = (data, filters = DEFAULT_FILTERS) => {
  if (!_.has(filters, 'risk')) {
    // absence of "risk" means there are only clusters that have at least 1 hit
    return filter(
      filtersConf,
      _.filter(data, (it) => it.total_hit_count > 0),
      filters
    );
  }
  return filter(filtersConf, data, filters);
};
const filterApply = (filters) => applyFilters(filters, filtersConf);

// TODO add more combinations of filters for testing
const filterCombos = [{ risk: ['Critical', 'Moderate'], name: 'foo' }];

// TODO use filterData in all tests except of data or namedClusters or namedClustersDefaultSorting

describe('data', () => {
  it('has values', () => {
    cy.wrap(filterData(data)).its('length').should('be.gte', 1);
  });
  it('has more entried than default pagination', () => {
    cy.wrap(filterData(data)).its('length').should('be.gt', DEFAULT_ROW_COUNT);
  });
  it('at least one cluster has cluster name', () => {
    cy.wrap(_.filter(filterData(data), (it) => it.cluster_name))
      .its('length')
      .should('be.gte', 1);
  });
  it('first cluster has name', () => {
    cy.wrap(filterData(data)[0]['cluster_name']).should('not.be.empty');
  });
  it('first page items contains at least one cluster without name', () => {
    const itemsInFirstPage = DEFAULT_DISPLAYED_SIZE;
    cy.wrap(
      _.filter(
        filterData(data).slice(0, itemsInFirstPage),
        (it) => it.cluster_name
      )
    )
      .its('length')
      .should('be.lt', itemsInFirstPage);
  });
  it('at least one entry has last seen', () => {
    cy.wrap(_.filter(filterData(data), (it) => it.last_checked_at))
      .its('length')
      .should('be.gte', 1);
  });
  it('at least one entry does not have last seen', () => {
    cy.wrap(
      _.filter(filterData(data), (it) => it.last_checked_at === undefined)
    )
      .its('length')
      .should('be.gte', 1);
  });
  it('at least one entry does not have all values for total risk categories', () => {
    cy.wrap(
      _.filter(
        filterData(clusters['data']),
        (it) => Object.keys(it['hits_by_total_risk']).length < 4
      )
    )
      .its('length')
      .should('be.gte', 1);
  });
  _.uniq(_.flatten(VERSION_COMBINATIONS)).map((c) =>
    it(`has at least one cluster with version ${c}`, () => {
      cy.wrap(_.filter(data, (it) => it.cluster_version === c))
        .its('length')
        .should('be.gte', 1);
    })
  );
  it(`has at least one cluster without a version`, () => {
    cy.wrap(_.filter(data, (it) => it.cluster_version === ''))
      .its('length')
      .should('be.gte', 1);
  });
  it('at least two clusters match foo for their names', () => {
    cy.wrap(filterData(data, { name: 'foo' }))
      .its('length')
      .should('be.gt', 1);
  });
  it('only one cluster matches foo bar in the name', () => {
    cy.wrap(filterData(data, { name: 'foo bar' }))
      .its('length')
      .should('be.eq', 1);
  });
  it('the first combo filter has less clusters hitting that the default and at least one', () => {
    cy.wrap(filterData(data, filterCombos[0]))
      .its('length')
      .should('be.gte', 1)
      .and('be.lt', filterData(data, {}).length); // TODO can use namedCluster.length directly unless data is optional
  });
});

describe('clusters list table', () => {
  // TODO remove those commands and convert to functions or utilities
  Cypress.Commands.add('getFirstRow', () => cy.get(TBODY).children().eq(0));

  beforeEach(() => {
    mount(
      <MemoryRouter initialEntries={['/clusters']} initialIndex={0}>
        <Intl>
          <Provider store={getStore()}>
            <ClustersListTable
              query={{
                isError: false,
                isFetching: false,
                isUninitialized: false,
                isSuccess: true,
                data: clusters,
                refetch: cy.stub(),
              }}
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

  it('shows correct total number of clusters', () => {
    checkPaginationTotal(data.length);
  });

  describe('defaults', () => {
    it(`shows maximum ${DEFAULT_ROW_COUNT} clusters`, () => {
      checkRowCounts(DEFAULT_DISPLAYED_SIZE);
      expect(window.location.search).to.contain(`limit=${DEFAULT_ROW_COUNT}`);
    });

    it(`pagination is set to ${DEFAULT_ROW_COUNT}`, () => {
      cy.get('.pf-c-options-menu__toggle-text')
        .find('b')
        .eq(0)
        .should('have.text', `1 - ${DEFAULT_DISPLAYED_SIZE}`);
    });

    it('sorting using last seen', () => {
      const column = 'Last seen';
      tableIsSortedBy(column);
      expect(window.location.search).to.contain(
        `sort=-${columnName2UrlParam(column)}`
      );
    });

    // TODO use hasChip function
    it('applies total risk "All clusters" filter', () => {
      cy.get(CHIP_GROUP)
        .find('.pf-c-chip-group__label')
        .should('have.text', 'Total risk');
      cy.get(CHIP_GROUP)
        .find('.pf-c-chip__text')
        .should('have.length', 1)
        .should('have.text', 'All clusters');
      expect(window.location.search).to.contain(`hits=all`);
    });

    it('reset filters button is displayed', () => {
      cy.get('button').contains('Reset filters').should('exist');
    });
  });

  describe('pagination', () => {
    it('shows correct total number of clusters', () => {
      checkPaginationTotal(data.length);
    });

    it('values are expected ones', () => {
      checkPaginationValues(PAGINATION_VALUES);
    });

    it('can change page limit', () => {
      // FIXME: best way to make the loop
      cy.wrap(PAGINATION_VALUES).each((el) => {
        changePagination(el).then(
          () => expect(window.location.search).to.contain(`limit=${el}`)
          // TODO should check below be nested here as well?
        );
        checkRowCounts(Math.min(el, data.length));
      });
    });
    it('can iterate over pages', () => {
      cy.wrap(itemsPerPage(data.length)).each((el, index, list) => {
        checkRowCounts(el).then(() => {
          expect(window.location.search).to.contain(
            `offset=${DEFAULT_ROW_COUNT * index}`
          );
        });
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
      [
        'name',
        'cluster_version',
        'total_hit_count',
        'hits_by_total_risk.4',
        'hits_by_total_risk.3',
        'hits_by_total_risk.2',
        'hits_by_total_risk.1',
        'last_checked_at',
      ],
      TABLE_HEADERS
    ).forEach(([category, label]) => {
      SORTING_ORDERS.forEach((order) => {
        it(`${order} by ${label}`, () => {
          const col = `td[data-label="${label}"]`;
          const header = `th[data-label="${label}"]`;

          cy.get(col).should('have.length', DEFAULT_DISPLAYED_SIZE);
          if (order === 'ascending') {
            cy.get(header)
              .find('button')
              .click()
              .then(() =>
                expect(window.location.search).to.contain(
                  `sort=${columnName2UrlParam(label)}`
                )
              );
          } else {
            cy.get(header)
              .find('button')
              .dblclick()
              .then(() =>
                expect(window.location.search).to.contain(
                  `sort=-${columnName2UrlParam(label)}`
                )
              );
          }

          // map missing last_check_at to old times
          if (category === 'last_checked_at') {
            category = (it) => it.last_checked_at || '1970-01-01T01:00:00.001Z';
          }

          cy.log(data, clusters);
          // add property name to clusters
          let sortedNames = _.map(
            // all tables must preserve original ordering
            category === 'cluster_version'
              ? // use ... spread operator because sort modifies the array on place
                [...data].sort(
                  (a, b) =>
                    (order === 'ascending' ? 1 : -1) *
                    compare(
                      a.cluster_version || '0.0.0',
                      b.cluster_version || '0.0.0'
                    )
                )
              : _.orderBy(
                  _.cloneDeep(data),
                  [category],
                  [order === 'ascending' ? 'asc' : 'desc']
                ),
            'name'
          );
          cy.get(`td[data-label="Name"]`)
            .then(($els) => {
              return _.map(Cypress.$.makeArray($els), 'innerText');
            })
            .should('deep.equal', sortedNames.slice(0, DEFAULT_ROW_COUNT));
        });
      });
    });
  });

  describe('filtering', () => {
    it('can clear filters', () => {
      removeAllChips();
      // apply some filters
      filterApply(filterCombos[0]);
      cy.get(CHIP_GROUP).should(
        'have.length',
        Object.keys(filterCombos[0]).length
      );
      cy.get(CHIP_GROUP).should('exist');
      // clear filters
      cy.get('button').contains('Reset filters').click();
      hasChip('Total risk', 'All clusters');
      cy.get(CHIP_GROUP).should('have.length', 1);
      cy.get('button').contains('Reset filters').should('exist');
      checkRowCounts(DEFAULT_DISPLAYED_SIZE);
    });

    it('empty state is displayed when filters do not match any rule', () => {
      removeAllChips();
      filterApply({
        name: 'Not existing clusters',
        risk: ['Critical', 'Moderate'],
      });
      // TODO check empty table view
      // TODO headers are displayed
    });

    describe.only('single filter', () => {
      Object.entries(filtersConf).forEach(([k, v]) => {
        v.values.forEach((filterValues) => {
          it(`${k}: ${filterValues}`, () => {
            const filters = {};
            filters[k] = filterValues;
            let sortedNames = _.map(
              filterData(namedClustersDefaultSorting, filters),
              'name'
            );
            removeAllChips();
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
            // validate chips and url params
            cy.get(CHIP_GROUP)
              .should('have.length', Object.keys(filters).length)
              .then(() => {
                for (const [k, v] of Object.entries(filtersConf)) {
                  if (k in filters) {
                    const urlValue = v.urlValue(filters[k]);
                    expect(window.location.search).to.contain(
                      `${v.urlParam}=${urlValue}`
                    );
                  } else {
                    expect(window.location.search).to.not.contain(
                      `${v.urlParam}=`
                    );
                  }
                }
              });
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
          let sortedNames = _.map(
            filterData(namedClustersDefaultSorting, filters),
            'name'
          );
          removeAllChips();
          filterApply(filters);
          if (sortedNames.length === 0) {
            // TODO check empty table view
          } else {
            cy.get(`td[data-label="Name"]`)
              .then(($els) => {
                return _.map(Cypress.$.makeArray($els), 'innerText');
              })
              .should('deep.equal', sortedNames.slice(0, DEFAULT_ROW_COUNT));
          }
          // validate chips and url params
          cy.get(CHIP_GROUP)
            .should('have.length', Object.keys(filters).length)
            .then(() => {
              for (const [k, v] of Object.entries(filtersConf)) {
                if (k in filters) {
                  const urlValue = v.urlValue(filters[k]);
                  expect(window.location.search).to.contain(
                    `${v.urlParam}=${urlValue}`
                  );
                } else {
                  expect(window.location.search).to.not.contain(
                    `${v.urlParam}=`
                  );
                }
              }
            });
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

  it('rows show cluster names instead uuids when available', () => {
    const names = _.map(namedClustersDefaultSorting, 'name');
    cy.get(`td[data-label="Name"]`)
      .then(($els) => {
        return _.map(Cypress.$.makeArray($els), 'innerText');
      })
      .should('deep.equal', names.slice(0, DEFAULT_DISPLAYED_SIZE));
  });

  it('names of rows are links', () => {
    cy.get(TBODY)
      .children()
      .each(($el, index) => {
        cy.wrap($el)
          .find('td[data-label=Name]')
          .find(
            `a[href="/clusters/${namedClustersDefaultSorting[index]['cluster_id']}"]`
          )
          .should('have.text', namedClustersDefaultSorting[index]['name']);
      });
  });

  // TODO avoid hardcoded values
  it('shows correct amount of each type of the rule hits', () => {
    cy.getFirstRow().find('td[data-label=Critical]').should('have.text', 2);
    cy.getFirstRow().find('td[data-label=Important]').should('have.text', 7);
    cy.getFirstRow().find('td[data-label=Moderate]').should('have.text', 9);
    cy.getFirstRow().find('td[data-label=Low]').should('have.text', 5);
  });
});

describe('cluster list Empty state rendering', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter initialEntries={['/clusters']} initialIndex={0}>
        <Intl>
          <Provider store={getStore()}>
            <ClustersListTable
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

  it('renders the Empty State component', () => {
    cy.get('div[class=pf-c-empty-state__content]')
      .should('have.length', 1)
      .find('h2')
      .should('have.text', 'No clusters yet');
    cy.get('div[class=pf-c-empty-state__body]').should(
      'have.text',
      'To get started, create or register your cluster to get recommendations from Insights Advisor.'
    );
    cy.get('div[class=pf-c-empty-state__content]')
      .children()
      .eq(3)
      .should('have.text', 'Create cluster');
    cy.get('div[class=pf-c-empty-state__secondary]')
      .children()
      .eq(0)
      .should('have.text', 'Register cluster');
    cy.get('div[class=pf-c-empty-state__secondary]')
      .children()
      .eq(1)
      .should('have.text', 'Assisted Installer clusters');
  });
});

// TODO tests for URL parameters and chips as in RecsListTable
