import React from 'react';
import _ from 'lodash';

import { mount } from '@cypress/react18';
import workloads from '../../../cypress/fixtures/api/insights-results-aggregator/v2/workloads.json';
import { WORKLOADS_LIST_COLUMNS } from '../../AppConstants';
import {
  DEFAULT_ROW_COUNT,
  PAGINATION_VALUES,
} from '../../../cypress/utils/defaults';
import { WorkloadsListTable } from './WorkloadsListTable';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import getStore from '../../Store';
import {
  CHIP_GROUP,
  PAGINATION,
  TABLE,
  TOOLBAR,
} from '../../../cypress/utils/components';
import {
  checkFiltering,
  checkNoMatchingWorkloads,
  checkRowCounts,
  checkSorting,
  checkTableHeaders,
} from '../../../cypress/utils/table';
import {
  changePagination,
  checkCurrentPage,
  checkPaginationSelected,
  checkPaginationTotal,
  checkPaginationValues,
  itemsPerPage,
} from '../../../cypress/utils/pagination';
import { cumulativeCombinations } from '../../../cypress/utils/combine';
import { SORTING_ORDERS, TOTAL_RISK } from '../../../cypress/utils/globals';
import { applyFilters, filter } from '../../../cypress/utils/filters';

let values = _.cloneDeep(workloads);
const dataUnsorted = _.cloneDeep(values);

const data = _.orderBy(
  values,
  [(it) => it.metadata.last_checked_at || '1970-01-01T01:00:00.001Z'],
  ['desc']
);

const ROOT = 'div[id=workloads-list-table]';
const TABLE_HEADERS = _.map(WORKLOADS_LIST_COLUMNS, (it, index) =>
  index === 0 ? 'Name' : it.title
);

const TOTAL_RISK_VALUES = Object.keys(TOTAL_RISK);
const TOTAL_RISK_MAP = _.cloneDeep(TOTAL_RISK);

const DEFAULT_DISPLAYED_SIZE = Math.min(data.length, DEFAULT_ROW_COUNT);

const filtersConf = {
  cluster_name: {
    selectorText: 'Cluster name',
    values: ['Foo', 'Foo Bar', 'Not existing cluster'],
    type: 'input',
    filterFunc: (it, value) =>
      it.cluster.display_name.toLowerCase().includes(value.toLowerCase()),
    urlParam: 'cluster_name',
    urlValue: (it) => it.replace(/ /g, '+'),
  },
  namespace_name: {
    selectorText: 'Namespace name',
    values: ['Foo', 'Foo Bar', 'Not existing namespace'],
    type: 'input',
    filterFunc: (it, value) =>
      it.namespace.name.toLowerCase().includes(value.toLowerCase()),
    urlParam: 'namespace_name',
    urlValue: (it) => it.replace(/ /g, '+'),
  },
  severity: {
    selectorText: 'Severity',
    values: Array.from(cumulativeCombinations(TOTAL_RISK_VALUES)),
    type: 'checkbox',
    filterFunc: (it, value) => {
      for (const risk of _.map(value, (x) => TOTAL_RISK_MAP[x])) {
        if (risk === '' || it.metadata.hits_by_severity[risk] > 0) return true;
      }
      return false;
    },
    urlParam: 'severity',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => TOTAL_RISK_MAP[x]).join(',')),
  },
};

const DEFAULT_FILTERS = {};

const filterData = (filters = DEFAULT_FILTERS, values = data) => {
  return filter(filtersConf, values, filters);
};
const filterApply = (filters) => applyFilters(filters, filtersConf);

const filterCombos = [
  { severity: ['Critical', 'Moderate'], cluster_name: 'foo' },
];

describe('data', () => {
  it('has values', () => {
    expect(filterData()).to.have.length.gt(1);
  });
  it('has more entries than default pagination', () => {
    expect(filterData()).to.have.length.gt(DEFAULT_ROW_COUNT);
  });
  it('at least one namespace has a cluster name', () => {
    expect(
      _.filter(filterData(), (it) => it.cluster.display_name)
    ).to.have.length.gte(1);
  });
  it('data contains at least one namespace without clustername', () => {
    const itemsInFirstPage = DEFAULT_DISPLAYED_SIZE;
    expect(
      _.filter(
        filterData().slice(0, itemsInFirstPage),
        (it) => it.cluster.display_name === ''
      )
    ).to.have.length.gte(1);
  });
  it('at least one entry has last seen', () => {
    expect(
      _.filter(filterData(), (it) => it.metadata.last_checked_at)
    ).to.have.length.gte(1);
  });
  it('at least one entry does not have last seen', () => {
    expect(
      _.filter(filterData(), (it) => it.metadata.last_checked_at === '')
    ).to.have.length.gte(1);
  });
  it('at least two clusters match foo for their names', () => {
    expect(filterData({ cluster_name: 'foo' })).to.have.length.gt(1);
  });
  it('at least one namespace matches foo bar in the name of the namespace', () => {
    expect(
      filterData({ namespace_name: 'foo bar namespace' })
    ).to.have.length.gt(1);
  });
});

describe('workloads list "No workload recommendations" Empty state rendering', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter
        initialEntries={['/openshift/insights/advisor/workloads']}
        initialIndex={0}
      >
        <Provider store={getStore()}>
          <WorkloadsListTable
            query={{
              isError: false,
              isFetching: false,
              isUninitialized: false,
              isSuccess: true,
              data: [],
            }}
          />
        </Provider>
      </MemoryRouter>
    );
  });
  it('renders the Empty State component', () => {
    cy.get('div[class=pf-v5-c-empty-state__content]')
      .should('have.length', 1)
      .find('h5')
      .should('have.text', 'No workload recommendations');
    cy.get('div[class=pf-v5-c-empty-state__body] p').should(
      'have.text',
      'There are no workload-related recommendations for your clusters. This page only shows workloads if there are recommendations available.'
    );
    cy.get('div[class=pf-v5-c-empty-state__body] button').should(
      'have.text',
      'Return to previous page'
    );
    cy.get('div[id=workloads-list-table]').should('not.exist');
  });
});

describe('workloads list "Workloads data unavailable" Empty state rendering', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter
        initialEntries={['/openshift/insights/advisor/workloads']}
        initialIndex={0}
      >
        <Provider store={getStore()}>
          <WorkloadsListTable
            query={{
              isError: true,
              error: { status: 404 },
              isFetching: false,
              isUninitialized: false,
              isSuccess: false,
              data: [],
            }}
          />
        </Provider>
      </MemoryRouter>
    );
  });

  it('renders the Empty State component', () => {
    cy.get('div[class=pf-v5-c-empty-state__content]')
      .should('have.length', 1)
      .find('h5')
      .should('have.text', 'Workloads data unavailable');
    cy.get('div[class=pf-v5-c-empty-state__body] p').should(
      'have.text',
      'Verify that your clusters are connected and sending data to Red Hat, and that the Deployment Validation Operator is installed and configured.'
    );
    cy.get('div[class=pf-v5-c-empty-state__body] button').should(
      'have.text',
      'Return to previous page'
    );
    cy.get('div[class=pf-v5-c-empty-state__body] a').should(
      'have.text',
      'View documentation'
    );
    cy.get('div[id=workloads-list-table]').should('not.exist');
  });
});

describe('workloads list table', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter
        initialEntries={['/openshift/insights/advisor/workloads']}
        initialIndex={0}
      >
        <Provider store={getStore()}>
          <WorkloadsListTable
            query={{
              isError: false,
              isFetching: false,
              isUninitialized: false,
              isSuccess: true,
              data: { workloads },
              refetch: cy.stub(),
            }}
          />
        </Provider>
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
        changePagination(el).then(() => {
          expect(window.location.search).to.contain(`limit=${el}`);
          checkRowCounts(Math.min(el, data.length));
        });
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
      ['name', 'recommendations', 'severity', 'objects', 'last_seen'],
      TABLE_HEADERS
    ).forEach(([category, label]) => {
      SORTING_ORDERS.forEach((order) => {
        it(`${order} by ${label}`, () => {
          let sortingParameter = category;
          // modify sortingParameters for certain values
          if (category === 'name') {
            // name sorting is case insensitive
            sortingParameter = (it) =>
              it.cluster?.display_name || it.cluster.uuid;
          } else if (category === 'recommendations') {
            sortingParameter = (it) => it.metadata.recommendations;
          } else if (category === 'severity') {
            sortingParameter = [
              "metadata.hits_by_severity['4']",
              "metadata.hits_by_severity['3']",
              "metadata.hits_by_severity['2']",
              "metadata.hits_by_severity['1']",
            ];
          } else if (category === 'objects') {
            sortingParameter = (it) => it.metadata.objects;
          } else if (category === 'last_seen') {
            sortingParameter = (it) =>
              it.metadata.last_checked_at || '1970-01-01T01:00:00.001Z';
          }

          checkSorting(
            dataUnsorted,
            sortingParameter,
            label === 'Name' ? 'column-0' : label,
            order,
            'column-0',
            (it) =>
              `${it.cluster.display_name || it.cluster.uuid}\n\n${
                it.namespace.name || it.namespace.uuid
              }`,
            Math.min(DEFAULT_ROW_COUNT, dataUnsorted.length),
            null
          );
        });
      });
    });
  });

  describe('filtering', () => {
    it('can clear filters', () => {
      // apply some filters
      filterApply(filterCombos[0]);
      cy.get(CHIP_GROUP).should(
        'have.length',
        Object.keys(filterCombos[0]).length
      );
      cy.get(CHIP_GROUP).should('exist');
      cy.get('button').contains('Reset filters').should('exist').click();
      checkRowCounts(Math.min(DEFAULT_ROW_COUNT, filterData({}).length));
    });

    it('will reset filters but not pagination and sorting', () => {
      filterApply({ cluster_name: 'a' });
      changePagination(PAGINATION_VALUES[0]);
      cy.get(TOOLBAR)
        .find(PAGINATION)
        .find('button[data-action="next"]')
        .click();

      // This is column-0 because the Name column has an icon inside
      cy.get('th[data-label="column-0"]').find('button').click();
      cy.get(TOOLBAR).find('button').contains('Reset filters').click();
      cy.get(CHIP_GROUP).should('have.length', 0);
      checkPaginationSelected(0);
      checkCurrentPage(1);
      cy.get('th[data-label="column-0"]')
        .should('have.attr', 'aria-sort')
        .and('contain', 'ascending');
    });

    it('empty state is displayed when filters do not match any rule', () => {
      filterApply({
        cluster_name: 'Not existing clusters',
        severity: ['Critical', 'Moderate'],
      });
      checkNoMatchingWorkloads();
      checkTableHeaders(TABLE_HEADERS);
    });

    describe('single filter', () => {
      Object.entries(filtersConf).forEach(([k, v]) => {
        v.values.forEach((filterValues) => {
          it(`${k}: ${filterValues}`, () => {
            const filters = { [k]: filterValues };
            checkFiltering(
              filters,
              filtersConf,
              _.map(
                filterData(filters).slice(0, DEFAULT_ROW_COUNT),
                (val) =>
                  `${val.cluster.display_name || val.cluster.uuid}\n\n${
                    val.namespace.name || val.namespace.uuid
                  }`
              ),
              'column-0',
              TABLE_HEADERS,
              'No matching workloads found',
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
            _.map(
              filterData(filters).slice(0, DEFAULT_ROW_COUNT),
              (val) =>
                `${val.cluster.display_name || val.cluster.uuid}\n\n${
                  val.namespace.name || val.namespace.uuid
                }`
            ),
            'column-0',
            TABLE_HEADERS,
            'No matching workloads found',
            false,
            false
          );
        });
      });
    });
  });
});
