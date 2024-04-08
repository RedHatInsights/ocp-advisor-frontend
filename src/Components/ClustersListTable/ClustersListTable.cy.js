import React from 'react';

import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import _ from 'lodash';

import { Intl } from '../../Utilities/intlHelper';
import getStore from '../../Store';
import { ClustersListTable } from './ClustersListTable';
import clusters from '../../../cypress/fixtures/api/insights-results-aggregator/v2/clusters.json';
import { CLUSTER_FILTER_CATEGORIES } from '../../AppConstants';
import { TBODY, ROW } from '../../../cypress/utils/components';
import {
  DEFAULT_ROW_COUNT,
  PAGINATION_VALUES,
} from '../../../cypress/utils/defaults';
import { SORTING_ORDERS, TOTAL_RISK } from '../../../cypress/utils/globals';
import { cumulativeCombinations } from '../../../cypress/utils/combine';
import {
  checkNoMatchingClusters,
  checkFiltering,
  checkSorting,
  checkRowCounts,
} from '../../../cypress/utils/table';
import { CLUSTERS_LIST_COLUMNS } from '../../AppConstants';
import {
  itemsPerPage,
  checkCurrentPage,
  checkPaginationSelected,
} from '../../../cypress/utils/pagination';
import FlagProvider from '@unleash/proxy-client-react';

import {
  TOOLBAR,
  PAGINATION,
  CHIP_GROUP,
  TABLE,
  checkPaginationTotal,
  checkPaginationValues,
  changePagination,
  checkTableHeaders,
  columnName2UrlParam,
  tableIsSortedBy,
  filter,
  hasChip,
  removeAllChips,
  urlParamConvert,
} from '@redhat-cloud-services/frontend-components-utilities';

import {
  VERSION_COMBINATIONS,
  applyFilters,
} from '../../../cypress/utils/filters';
import {
  clustersUpdateRisksInterceptors,
  featureFlagsInterceptors,
} from '../../../cypress/utils/interceptors';

const lessClusters = {
  data: [...clusters.data.slice(0, 28)],
  meta: {
    count: 28,
  },
  status: 'ok',
};

// add property name to clusters
let values = _.cloneDeep(clusters['data']);
values.forEach(
  (it) =>
    (it['name'] = it['cluster_name'] ? it['cluster_name'] : it['cluster_id'])
);
// fill possible missing values
values.forEach((it) => {
  ['1', '2', '3', '4'].forEach((k) => {
    it['hits_by_total_risk'][k] = it['hits_by_total_risk'][k]
      ? it['hits_by_total_risk'][k]
      : 0;
  });
});
const dataUnsorted = _.cloneDeep(values);
// default sorting
const data = _.orderBy(
  values,
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
};

const DEFAULT_FILTERS = { risk: ['All clusters'] };

// TODO invert parameters and make data optional as well
const filterData = (filters = DEFAULT_FILTERS, values = data) => {
  if (!_.has(filters, 'risk')) {
    // absence of "risk" means there are only clusters that have at least 1 hit
    return filter(
      filtersConf,
      _.filter(values, (it) => it.total_hit_count > 0),
      filters
    );
  }
  return filter(filtersConf, values, filters);
};
const filterApply = (filters) => applyFilters(filters, filtersConf);

const mountLessClusters = () => {
  cy.mount(
    <FlagProvider
      config={{
        url: 'http://localhost:8002/feature_flags',
        clientKey: 'abc',
        appName: 'abc',
      }}
    >
      <MemoryRouter
        initialEntries={['/openshift/insights/advisor/clusters']}
        initialIndex={0}
      >
        <Intl>
          <Provider store={getStore()}>
            <ClustersListTable
              query={{
                isError: false,
                isFetching: false,
                isUninitialized: false,
                isSuccess: true,
                data: lessClusters,
                refetch: cy.stub(),
              }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    </FlagProvider>
  );
};

// TODO add more combinations of filters for testing
const filterCombos = [{ risk: ['Critical', 'Moderate'], name: 'foo' }];

// TODO: when checking empty state, also check toolbar available and not disabled

describe('data', () => {
  it('has values', () => {
    expect(filterData()).to.have.length.gte(1);
  });
  it('has more entries than default pagination', () => {
    expect(filterData()).to.have.length.gt(DEFAULT_ROW_COUNT);
  });
  it('at least one cluster has cluster name', () => {
    expect(_.filter(filterData(), (it) => it.cluster_name)).to.have.length.gte(
      1
    );
  });
  it('first page items contains at least one cluster without name', () => {
    const itemsInFirstPage = DEFAULT_DISPLAYED_SIZE;
    expect(
      _.filter(filterData().slice(0, itemsInFirstPage), (it) => it.cluster_name)
    ).to.have.length.lt(itemsInFirstPage);
  });
  it('at least one entry has last seen', () => {
    expect(
      _.filter(filterData(), (it) => it.last_checked_at)
    ).to.have.length.gte(1);
  });
  it('at least one entry does not have last seen', () => {
    expect(
      _.filter(filterData(), (it) => it.last_checked_at === undefined)
    ).to.have.length.gte(1);
  });
  it('at least one entry in the original data does not have all values for total risk categories', () => {
    expect(
      _.filter(
        filterData(DEFAULT_FILTERS, clusters['data']),
        (it) => Object.keys(it['hits_by_total_risk']).length < 4
      )
    ).to.have.length.gte(1);
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
    expect(filterData({ name: 'foo' })).to.have.length.gt(1);
  });
  it('only one cluster matches foo bar in the name', () => {
    expect(filterData({ name: 'foo bar' })).to.have.lengthOf(1);
  });
  it('the first combo filter has less clusters hitting that the default and at least one', () => {
    const filteredData = filterData(filterCombos[0]);
    expect(filteredData).to.have.length.gte(1);
    expect(filteredData).to.have.length.lt(filterData({}).length); // TODO can use namedCluster.length directly unless data is optional
  });
});

const urlParamsList = [
  'text=test&version=4.9.0&hits=4',
  'text=test&version=4.9.0&hits=3',
  'text=test&version=4.10.0&hits=2',
  'text=test&hits=1&version=4.2.35',
  'text=test&hits=1,2,3&version=4.2.35',
  'text=test&hits=1,2,4&version=4.1.2',
];

urlParamsList.forEach((urlParams, index) => {
  describe(`pre-filled url search parameters ${index}`, () => {
    beforeEach(() => {
      clustersUpdateRisksInterceptors['error, status not ok']();
      cy.mount(
        <FlagProvider
          config={{
            url: 'http://localhost:8002/feature_flags',
            clientKey: 'abc',
            appName: 'abc',
          }}
        >
          <MemoryRouter
            initialEntries={[
              `/openshift/insights/advisor/clusters?${urlParams}`,
            ]}
            initialIndex={0}
          >
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
        </FlagProvider>
      );
    });

    it('recognizes all parameters', () => {
      const urlSearchParameters = new URLSearchParams(urlParams);
      for (const [key, value] of urlSearchParameters) {
        if (key == 'text') {
          hasChip('Name', value);
          cy.get('.pf-m-fill > .pf-v5-c-form-control > input').should(
            'have.value',
            value
          );
        } else {
          value.split(',').forEach((it) => {
            const [group, item] = urlParamConvert(
              key,
              it,
              CLUSTER_FILTER_CATEGORIES
            );
            hasChip(group, item);
          });
        }
      }
      // do not get more chips than expected
      cy.get(CHIP_GROUP).should(
        'have.length',
        Array.from(urlSearchParameters).length
      );
    });
  });
});

describe('clusters list table', () => {
  beforeEach(() => {
    clustersUpdateRisksInterceptors['error, status not ok']();
    cy.mount(
      <FlagProvider
        config={{
          url: 'http://localhost:8002/feature_flags',
          clientKey: 'abc',
          appName: 'abc',
        }}
      >
        <MemoryRouter
          initialEntries={['/openshift/insights/advisor/clusters']}
          initialIndex={0}
        >
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
      </FlagProvider>
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
      cy.get('.pf-v5-c-menu-toggle__text')
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

    it('applies total risk "All clusters" filter', () => {
      hasChip('Total risk', 'All clusters');
      cy.get(CHIP_GROUP).find('.pf-v5-c-chip__text').should('have.length', 1);
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
          cy.get('[data-ouia-component-id=loading-skeleton]').should(
            'not.exist'
          );
          let sortingParameter = category;
          // modify sortingParameters for certain values

          if (category === 'last_checked_at') {
            // map missing last_check_at to old times
            sortingParameter = (it) =>
              it.last_checked_at || '1970-01-01T01:00:00.001Z';
          } else if (category === 'cluster_version') {
            sortingParameter = (it) =>
              (it.cluster_version || '0.0.0')
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
            DEFAULT_DISPLAYED_SIZE,
            label
          );
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

    it('will reset filters but not pagination and sorting', () => {
      filterApply({ name: '0' });
      changePagination(PAGINATION_VALUES[0]);
      cy.get(TOOLBAR)
        .find(PAGINATION)
        .find('button[data-action="next"]')
        .then(($button) => {
          cy.wrap($button).click();
        });

      cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
      cy.get('th[data-label="Name"]').find('button').click();
      cy.get(TOOLBAR).find('button').contains('Reset filters').click();
      cy.get(CHIP_GROUP).should('have.length', 1);
      checkPaginationSelected(0);
      checkCurrentPage(1);
      cy.get('th[data-label="Name"]')
        .should('have.attr', 'aria-sort')
        .and('contain', 'ascending');
    });

    it('empty state is displayed when filters do not match any rule', () => {
      removeAllChips();
      filterApply({
        name: 'Not existing clusters',
        risk: ['Critical', 'Moderate'],
      });
      checkNoMatchingClusters();
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
              _.map(filterData(filters), 'name').slice(0, DEFAULT_ROW_COUNT),
              'Name',
              TABLE_HEADERS,
              'No matching clusters found',
              true,
              true
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
            true,
            true
          );
        });
      });
    });
  });

  it('rows show cluster names instead uuids when available', () => {
    const names = _.map(data, 'name');
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
    cy.get(`td[data-label="Name"]`)
      .then(($els) => {
        return _.map(Cypress.$.makeArray($els), 'innerText');
      })
      .should('deep.equal', names.slice(0, DEFAULT_DISPLAYED_SIZE));
  });

  it('names of rows are links', () => {
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
    cy.get(TBODY)
      .children()
      .each(($el, index) => {
        cy.wrap($el)
          .find('td[data-label=Name]')
          .find(
            `a[href="/openshift/insights/advisor/clusters/${data[index]['cluster_id']}"]`
          )
          .should('have.text', data[index]['name']);
      });
  });

  it('total risk hits are mapped correctly', () => {
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
    cy.get('table')
      .find(TBODY)
      .find(ROW)
      .each(($el, index) => {
        Object.keys(TOTAL_RISK).forEach((riskCategory) => {
          cy.wrap($el)
            .find(`td[data-label=${riskCategory}]`)
            .should(($el) => {
              const expectedNumber =
                data[index].hits_by_total_risk[TOTAL_RISK_MAP[riskCategory]] ||
                0;
              expect($el.text()).to.eq(expectedNumber.toString());
            });
        });
        cy.wrap($el)
          .find(`td[data-label="Recommendations"]`)
          .should(($el) => {
            const totalHitsNumber = Object.values(
              data[index].hits_by_total_risk
            ).reduce((acc, it) => acc + it, 0);
            expect($el.text()).to.eq(totalHitsNumber.toString());
          });
      });
  });
});

describe('cluster list Empty state rendering', () => {
  beforeEach(() => {
    clustersUpdateRisksInterceptors['error, status not ok']();
    cy.mount(
      <FlagProvider
        config={{
          url: 'http://localhost:8002/feature_flags',
          clientKey: 'abc',
          appName: 'abc',
        }}
      >
        <MemoryRouter
          initialEntries={['/openshift/insights/advisor/clusters']}
          initialIndex={0}
        >
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
      </FlagProvider>
    );
  });

  it('renders the Empty State component', () => {
    cy.get('div[class=pf-v5-c-empty-state__content]')
      .should('have.length', 1)
      .find('h2')
      .should('have.text', 'No clusters yet');
    cy.get('div[class=pf-v5-c-empty-state__body]').should(
      'have.text',
      'To get started, create or register your cluster to get recommendations from Insights Advisor.'
    );
    cy.get('div[class=pf-v5-c-empty-state__footer]')
      .find('a')
      .eq(0)
      .should('have.text', 'Create cluster');
    cy.get('div[class=pf-v5-c-empty-state__footer]')
      .find('a')
      .eq(1)
      .should('have.text', 'Register cluster');
    cy.get('div[class=pf-v5-c-empty-state__footer]')
      .find('a')
      .eq(2)
      .should('have.text', 'Assisted Installer clusters');
  });
});

describe('update risk', () => {
  beforeEach(() => {
    featureFlagsInterceptors.upgradeRisksSuccessful();
  });

  describe('one label', () => {
    beforeEach(() => {
      clustersUpdateRisksInterceptors['successful']();
      mountLessClusters();
    });

    it('displays one label', () => {
      cy.get(
        'span[class=pf-v5-c-label__content]:contains("Update risk")'
      ).should('have.length', 1);
    });
  });

  describe('two labels', () => {
    beforeEach(() => {
      clustersUpdateRisksInterceptors['successful, two labels']();
      mountLessClusters();
    });

    it('displays two labels', () => {
      cy.get(
        'span[class=pf-v5-c-label__content]:contains("Update risk")'
      ).should('have.length', 2);
    });
  });

  describe('no labels', () => {
    beforeEach(() => {
      clustersUpdateRisksInterceptors['successful, no labels']();
      mountLessClusters();
    });

    it('displays no labels', () => {
      cy.get(
        'span[class=pf-v5-c-label__content]:contains("Update risk")'
      ).should('have.length', 0);
    });
  });

  describe('no labels', () => {
    beforeEach(() => {
      clustersUpdateRisksInterceptors['successful, no labels']();
      mountLessClusters();
    });

    it('displays no labels', () => {
      cy.get(
        'span[class=pf-v5-c-label__content]:contains("Update risk")'
      ).should('have.length', 0);
    });
  });

  describe('status not ok', () => {
    beforeEach(() => {
      clustersUpdateRisksInterceptors['error, status not ok']();
      mountLessClusters();
    });

    it("don't block table rendering on error", () => {
      cy.wait('@clustersUpdateRisksNotOk');
      cy.ouiaId('loading-skeleton').should('not.exist');
      checkRowCounts(lessClusters.meta.count);
    });
  });

  describe('error not found', () => {
    beforeEach(() => {
      clustersUpdateRisksInterceptors['error, not found']();
      mountLessClusters();
    });

    it("don't block table rendering on error", () => {
      cy.wait('@clustersUpdateRisks404');
      cy.ouiaId('loading-skeleton').should('not.exist');
      checkRowCounts(lessClusters.meta.count);
    });
  });

  describe('error other', () => {
    beforeEach(() => {
      clustersUpdateRisksInterceptors['error, other']();
      mountLessClusters();
    });

    it("don't block table rendering on error", () => {
      cy.wait('@clustersUpdateRisks500');
      cy.ouiaId('loading-skeleton').should('not.exist');
      checkRowCounts(lessClusters.meta.count);
    });
  });

  describe('long responding', () => {
    beforeEach(() => {
      clustersUpdateRisksInterceptors['long responding']();
      mountLessClusters();
    });

    it("don't block table rendering on ", () => {
      cy.wait('@clustersUpdateRisksLong');
      cy.ouiaId('loading-skeleton').should('not.exist');
      checkRowCounts(lessClusters.meta.count);
    });
  });
});

describe('update risk enabled and ui flag disabled', () => {
  beforeEach(() => {
    featureFlagsInterceptors.upgradeRisksDisabled();
  });

  describe('two clusters enabled', () => {
    beforeEach(() => {
      clustersUpdateRisksInterceptors['successful, two labels']();
      mountLessClusters();
    });

    it("doesn't displays two labels", () => {
      cy.wait('@upgradeRisksFlagDisabled');
      // Expect no requests
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000);
      cy.get('@clustersUpdateRisksOKTwo.all').then((interceptions) => {
        expect(interceptions).to.have.length(0);
      });
      cy.ouiaId('loading-skeleton').should('not.exist');
      cy.get(
        'span[class=pf-v5-c-label__content]:contains("Update risk")'
      ).should('have.length', 0);
    });
  });
});

describe('both update risk flags disabled', () => {
  beforeEach(() => {
    featureFlagsInterceptors.upgradeRisksDisabled2();
  });

  describe('two clusters enabled', () => {
    beforeEach(() => {
      clustersUpdateRisksInterceptors['successful, two labels']();
      mountLessClusters();
    });

    it("doesn't displays two labels", () => {
      cy.wait('@upgradeRisksFlagDisabled');
      // Expect no requests
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000);
      cy.get('@clustersUpdateRisksOKTwo.all').then((interceptions) => {
        expect(interceptions).to.have.length(0);
      });
      cy.ouiaId('loading-skeleton').should('not.exist');
      cy.get(
        'span[class=pf-v5-c-label__content]:contains("Update risk")'
      ).should('have.length', 0);
    });
  });
});

// TODO tests for URL parameters and chips as in RecsListTable
