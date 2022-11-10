import React from 'react';
import { mount } from '@cypress/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import _ from 'lodash';

import getStore from '../../Store';
import ClusterRules from './ClusterRules';
import { CLUSTER_RULES_COLUMNS } from '../../AppConstants';
import singleClusterPageReport from '../../../cypress/fixtures/api/insights-results-aggregator/v2/cluster/dcb95bbf-8673-4f3a-a63c-12d4a530aa6f/reports-disabled-false.json';
import data_first_query_parameter from '../../../cypress/fixtures/api/insights-results-aggregator/v1/clusters/41c30565-b4c9-49f2-a4ce-3277ad22b258/report.json';
import {
  TOTAL_RISK,
  CATEGORIES,
  SORTING_ORDERS,
} from '../../../cypress/utils/globals';
import { applyFilters, filter } from '../../../cypress/utils/filters';
import { cumulativeCombinations } from '../../../cypress/utils/combine';
import {
  checkEmptyState,
  checkNoMatchingRecs,
  checkTableHeaders,
  checkRowCounts,
  checkFiltering,
  checkSorting,
} from '../../../cypress/utils/table';
import {
  CHIP_GROUP,
  ROW,
  TOOLBAR,
  TABLE,
  ROWS_TOGGLER,
} from '../../../cypress/utils/components';

const data = singleClusterPageReport.report.data;

const ROOT = 'div[id=cluster-recs-list-table]';
const EXPANDABLES = '[class="pf-c-table__expandable-row pf-m-expanded"]';
const TABLE_HEADERS = _.map(CLUSTER_RULES_COLUMNS, (it) => it.title);

const RULES_ENABLED = _.filter(data, (it) => !it.disabled).length;

const TOTAL_RISK_VALUES = Object.keys(TOTAL_RISK);
const CATEGORY_TAGS = _.flatten(Object.values(CATEGORIES));

const filtersConf = {
  description: {
    selectorText: 'Description',
    values: ['Lorem IPSUM', '1Lorem', 'Not existing recommendation'],
    type: 'input',
    filterFunc: (it, value) =>
      it.description.toLowerCase().includes(value.toLowerCase()),
  },
  risk: {
    selectorText: 'Total risk',
    values: Array.from(cumulativeCombinations(TOTAL_RISK_VALUES)),
    type: 'checkbox',
    filterFunc: (it, value) =>
      _.map(value, (x) => TOTAL_RISK[x]).includes(it.total_risk),
  },
  category: {
    selectorText: 'Category',
    values: Array.from(cumulativeCombinations(Object.keys(CATEGORIES))),
    type: 'checkbox',
    filterFunc: (it, value) =>
      _.intersection(
        _.flatMap(value, (x) => CATEGORIES[x]),
        it.tags
      ).length > 0,
  },
};

const filterData = (filters) => filter(filtersConf, data, filters);
const filterApply = (filters) => applyFilters(filters, filtersConf);

// TODO add more combinations of filters for testing
const filterCombos = [
  { risk: ['Critical', 'Moderate'], category: ['Service Availability'] },
];

// TODO: when checking empty state, also check toolbar available and not disabled

describe('test data', () => {
  it('has rules', () => {
    expect(data).to.have.length.gte(1);
  });
  it('has more than 1 enabled rule', () => {
    expect(RULES_ENABLED).to.be.gt(1);
  });
  it('has 0 disabled rules', () => {
    expect(_.filter(data, (it) => it.disabled)).to.have.lengthOf(0);
  });
  it('all total risk values are present', () => {
    expect(_.uniq(_.map(data, 'total_risk'))).to.have.lengthOf(
      TOTAL_RISK_VALUES.length
    );
  });
  it('all categories are present', () => {
    expect(_.uniq(_.flatMap(data, 'tags'))).to.have.lengthOf(
      CATEGORY_TAGS.length
    );
  });
  it('at least 2 descriptions are different', () => {
    expect(_.uniq(_.map(data, 'description'))).to.have.length.gte(2);
  });
  it('has only 1 description matching "1Lorem"', () => {
    expect(filterData({ description: '1Lorem' })).to.have.lengthOf(1);
  });
  it('has multiple descriptions matching "Lorem ipsum"', () => {
    expect(filterData({ description: 'Lorem ipsum' })).to.have.length.gt(1);
  });
  it('has no descriptions matching "Not existing recommendation"', () => {
    expect(
      filterData({
        description: 'Not existing recommendation',
      })
    ).to.have.lengthOf(0);
  });
  it('the first combo filter has less rules hitting that the default and at least one', () => {
    const filteredData = filterData(filterCombos[0]);
    expect(filteredData).to.have.length.gte(1);
    expect(filteredData).to.have.length.lt(RULES_ENABLED);
  });
  it('has at least 1 rule with missing impacted field', () => {
    expect(
      data.map((rule) => !Object.hasOwn(rule, 'impacted')).length
    ).to.be.gte(1);
  });
});

describe('cluster rules table', () => {
  beforeEach(() => {
    mount(
      <IntlProvider locale="en">
        <Provider store={getStore()}>
          <MemoryRouter
            initialEntries={['/clusters/41c30565-b4c9-49f2-a4ce-3277ad22b258']}
            initialIndex={0}
          >
            <Route path="/clusters/:clusterId">
              <ClusterRules
                cluster={{
                  isError: false,
                  isFetching: false,
                  isUninitialized: false,
                  isSuccess: true,
                  data: { report: { data } },
                }}
              />
            </Route>
          </MemoryRouter>
        </Provider>
      </IntlProvider>
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

  it('total risk is mapped', () => {
    cy.get('td[data-label="Total risk"]').each((el) => {
      cy.wrap(el).should((risk) => {
        expect(risk.text()).to.be.oneOf(TOTAL_RISK_VALUES);
      });
    });
  });

  describe('defaults', () => {
    it('only one row is expanded', () => {
      cy.get('#expanded-content1').should('have.length', 1);
      cy.get(EXPANDABLES).should('have.length', 1);
    });
    it('no chips are displayed by default', () => {
      cy.get(CHIP_GROUP).should('not.exist');
      cy.get('button').contains('Reset filters').should('not.exist');
    });
    it('all expected rows are displayed', () => {
      checkRowCounts(RULES_ENABLED);
    });
  });

  it('expand all, collapse all', () => {
    cy.get(ROWS_TOGGLER).click();
    cy.get(EXPANDABLES).should('have.length', RULES_ENABLED);
    cy.get(ROWS_TOGGLER).click();
    cy.get(EXPANDABLES).should('have.length', 0);
  });

  it('expand one row then sort', () => {
    cy.get('#expandable-toggle2').click();
    cy.get(TABLE)
      .find('th[data-label=Description]')
      .find('button')
      .click()
      .click();
    cy.get(EXPANDABLES).should('have.length', 2);
  });

  describe('sorting', () => {
    // all tables must preserve original ordering
    _.zip(
      ['description', 'created_at', 'impacted', 'total_risk'],
      TABLE_HEADERS
    ).forEach(([category, label]) => {
      SORTING_ORDERS.forEach((order) => {
        it(`${order} by ${label}`, () => {
          let sortingParameter = category;
          // modify sortingParameters for certain values
          if (category === 'impacted') {
            sortingParameter = (it) =>
              it.impacted || '1970-01-01T01:00:00.001Z';
          }

          checkSorting(
            data,
            sortingParameter,
            label,
            order,
            'Description',
            'description',
            RULES_ENABLED,
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
      cy.get(CHIP_GROUP).should('exist');
      // clear filters
      cy.get('button').contains('Reset filters').click();
      cy.get(CHIP_GROUP).should('not.exist');
      cy.get('button').contains('Reset filters').should('not.exist');
      // expandable rows are duplicated, so we get one label
      cy.get(TABLE)
        .find(ROW)
        .find(`td[data-label="Description"]`)
        .should('have.length', RULES_ENABLED);
    });

    it('will reset filters but not pagination and sorting', () => {
      filterApply({ description: 'Lo' });

      cy.get('th[data-label="Description"]').find('button').click();
      cy.get(TOOLBAR).find('button').contains('Reset filters').click();
      cy.get(TOOLBAR).find(CHIP_GROUP).should('not.exist');
      cy.get('th[data-label="Description"]')
        .should('have.attr', 'aria-sort')
        .and('contain', 'ascending');
    });

    it('chips can be cleared', () => {
      filterApply(filterCombos[0]);
      cy.get(CHIP_GROUP).should('exist');
      cy.get('button').contains('Reset filters').click();
      cy.get(CHIP_GROUP).should('not.exist');
    });

    it('empty state is displayed when filters do not match any rule', () => {
      filterApply({
        description: 'Not existing recommendation',
      });
      checkNoMatchingRecs();
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
              _.map(filterData(filters), 'description'),
              'Description',
              TABLE_HEADERS,
              'No matching recommendations found',
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
            _.map(filterData(filters), 'description'),
            'Description',
            TABLE_HEADERS,
            'No matching recommendations found',
            false,
            false
          );
        });
      });
    });
  });
});

describe('empty cluster rules table', () => {
  beforeEach(() => {
    mount(
      <IntlProvider locale="en">
        <Provider store={getStore()}>
          <MemoryRouter
            initialEntries={['/clusters/41c30565-b4c9-49f2-a4ce-3277ad22b258']}
            initialIndex={0}
          >
            <Route path="/clusters/:clusterId">
              <ClusterRules
                cluster={{
                  isError: false,
                  isFetching: false,
                  isUninitialized: false,
                  isSuccess: true,
                  data: { report: { data: [] } },
                }}
              />
            </Route>
          </MemoryRouter>
        </Provider>
      </IntlProvider>
    );
  });

  it('cannot add filters', () => {
    cy.get('input[data-ouia-component-type="PF4/TextInput"]').type('some text');
    cy.get(CHIP_GROUP).should('not.exist');
    cy.get('div.ins-c-conditional-filter')
      .find('button[data-ouia-component-type="PF4/DropdownToggle"]')
      .should('be.disabled');
  });

  it('renders "the cluster is not affected" message', () => {
    checkEmptyState(
      'The cluster is not affected by any known recommendations',
      true
    );
  });
});

describe('no rules cluster', () => {
  beforeEach(() => {
    mount(
      <IntlProvider locale="en">
        <Provider store={getStore()}>
          <MemoryRouter
            initialEntries={['/clusters/41c30565-b4c9-49f2-a4ce-3277ad22b258']}
            initialIndex={0}
          >
            <Route path="/clusters/:clusterId">
              <ClusterRules
                cluster={{
                  isError: true,
                  isFetching: false,
                  isUninitialized: false,
                  isSuccess: false,
                  error: { status: 404 },
                }}
              />
            </Route>
          </MemoryRouter>
        </Provider>
      </IntlProvider>
    );
  });

  it('cannot add filters', () => {
    cy.get('input[data-ouia-component-type="PF4/TextInput"]').type('some text');
    cy.get(CHIP_GROUP).should('not.exist');
    cy.get('div.ins-c-conditional-filter')
      .find('button[data-ouia-component-type="PF4/DropdownToggle"]')
      .should('be.disabled');
  });

  it('renders "no recommendation to display" message', () => {
    checkEmptyState('No recommendations to display', true);
  });

  // TODO: incorporate this check in other tests
  it('data-ouia-safe set to true', () => {
    cy.get('#cluster-recs-list-table').should(
      'have.attr',
      'data-ouia-safe',
      'true'
    );
  });
});

describe('error response other than 404', () => {
  beforeEach(() => {
    mount(
      <IntlProvider locale="en">
        <Provider store={getStore()}>
          <MemoryRouter
            initialEntries={['/clusters/41c30565-b4c9-49f2-a4ce-3277ad22b258']}
            initialIndex={0}
          >
            <Route path="/clusters/:clusterId">
              <ClusterRules
                cluster={{
                  isError: true,
                  isFetching: false,
                  isUninitialized: false,
                  isSuccess: false,
                  error: { status: 500 },
                }}
              />
            </Route>
          </MemoryRouter>
        </Provider>
      </IntlProvider>
    );
  });

  it('cannot add filters', () => {
    cy.get('input[data-ouia-component-type="PF4/TextInput"]').type('some text');
    cy.get(CHIP_GROUP).should('not.exist');
    cy.get('div.ins-c-conditional-filter')
      .find('button[data-ouia-component-type="PF4/DropdownToggle"]')
      .should('be.disabled');
  });

  it('renders "no recommendation to display" message', () => {
    checkEmptyState('No recommendations available', true);
  });

  it('data-ouia-safe set to true', () => {
    cy.get('#cluster-recs-list-table').should(
      'have.attr',
      'data-ouia-safe',
      'true'
    );
  });
});

describe('cluster rules table testing the first query parameter', () => {
  beforeEach(() => {
    mount(
      <IntlProvider locale="en">
        <Provider store={getStore()}>
          <MemoryRouter
            initialEntries={[
              '/clusters/41c30565-b4c9-49f2-a4ce-3277ad22b258?first=external.rules.rule_n_one|ERROR_KEY_N2',
            ]}
            initialIndex={0}
          >
            <Route path="/clusters/:clusterId">
              <ClusterRules
                cluster={{
                  isError: false,
                  isFetching: false,
                  isUninitialized: false,
                  isSuccess: true,
                  data: { report: { data: data_first_query_parameter } },
                }}
              />
            </Route>
          </MemoryRouter>
        </Provider>
      </IntlProvider>
    );
  });

  it('show the rule from the "first" search parameter', () => {
    cy.get(TABLE)
      .find('td[data-label=Description]')
      .children()
      .eq(0)
      .should('have.text', 'testing the first query parameter ');
  });

  SORTING_ORDERS.forEach((order) => {
    it(`can still sort ${order}`, () => {
      const label = 'Description';
      const category = 'description';
      const col = `td[data-label="${label}"]`;
      const header = `th[data-label="${label}"]`;
      cy.get(col).should('have.length', RULES_ENABLED);

      if (order === 'ascending') {
        cy.get(header).find('button').click();
      } else {
        cy.get(header).find('button').click().click();
      }
      let sortedDescriptions = _.map(
        _.orderBy(
          data_first_query_parameter,
          [category],
          [order === 'descending' ? 'desc' : 'asc']
        ),
        'description'
      );
      cy.get(`td[data-label="Description"]`)
        .then(($els) => {
          return _.map(Cypress.$.makeArray($els), 'innerText');
        })
        .should('deep.equal', sortedDescriptions);
    });
  });
});
