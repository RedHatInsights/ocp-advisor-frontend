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
import { checkTableHeaders } from '../../../cypress/utils/table';
import {
  CHIP_GROUP,
  CHIP,
  ROW,
  TOOLBAR,
  TABLE,
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

const filterData = (data, filters) => filter(filtersConf, data, filters);
const filterApply = (filters) => applyFilters(filters, filtersConf);

// TODO add more combinations of filters for testing
const filterCombos = [
  { risk: ['Critical', 'Moderate'], category: ['Service Availability'] },
];

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
    expect(filterData(data, { description: '1Lorem' })).to.have.lengthOf(1);
  });
  it('has multiple descriptions matching "Lorem ipsum"', () => {
    expect(filterData(data, { description: 'Lorem ipsum' })).to.have.length.gt(
      1
    );
  });
  it('has no descriptions matching "Not existing recommendation"', () => {
    expect(
      filterData(data, {
        description: 'Not existing recommendation',
      })
    ).to.have.lengthOf(0);
  });
  it('the first combo filter has less rules hitting that the default and at least one', () => {
    const filteredData = filterData(data, filterCombos[0]);
    expect(filteredData).to.have.length.gte(1);
    expect(filteredData).to.have.length.lt(RULES_ENABLED);
  });
});

describe('cluster rules table', () => {
  beforeEach(() => {
    // the flag tells not to fetch external federated modules
    window.CYPRESS_RUN = true;

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
  });

  it('expand all, collapse all', () => {
    const TOOLBAR = '[class="pf-c-toolbar__item"]';

    cy.get(TOOLBAR).find('button').click();
    cy.get(EXPANDABLES).should('have.length', RULES_ENABLED);
    cy.get(TOOLBAR).find('button').click();
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
    _.zip(['description', 'created_at', 'total_risk'], TABLE_HEADERS).forEach(
      ([category, label]) => {
        SORTING_ORDERS.forEach((order) => {
          it(`${order} by ${label}`, () => {
            const col = `td[data-label="${label}"]`;
            const header = `th[data-label="${label}"]`;
            cy.get(col).should('have.length', RULES_ENABLED);

            if (order === 'ascending') {
              cy.get(header).find('button').click();
            } else {
              cy.get(header).find('button').dblclick();
            }
            let sortedDescriptions = _.map(
              _.orderBy(
                data,
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
      }
    );
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
      // TODO check empty table view
      // TODO headers are displayed
    });

    describe('single filter', () => {
      Object.entries(filtersConf).forEach(([k, v]) => {
        v.values.forEach((filterValues) => {
          it(`${k}: ${filterValues}`, () => {
            const filters = {};
            filters[k] = filterValues;
            const sortedDescriptions = _.map(
              filterData(data, filters),
              'description'
            ).sort();
            filterApply(filters);
            if (sortedDescriptions.length === 0) {
              // TODO check empty table view
              // TODO headers are displayed
            } else {
              cy.get(`td[data-label="Description"]`)
                .then(($els) => {
                  return _.map(Cypress.$.makeArray($els), 'innerText').sort();
                })
                .should('deep.equal', sortedDescriptions);
            }
            // validate chips
            cy.get(CHIP_GROUP).should(
              'have.length',
              Object.keys(filters).length
            );
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
          const sortedDescriptions = _.map(
            filterData(data, filters),
            'description'
          ).sort();
          filterApply(filters);
          if (sortedDescriptions.length === 0) {
            // TODO check empty table view
          } else {
            cy.get(`td[data-label="Description"]`)
              .then(($els) => {
                return _.map(Cypress.$.makeArray($els), 'innerText');
              })
              .should('deep.equal', sortedDescriptions);
          }
          // validate chips
          cy.get(CHIP_GROUP).should('have.length', Object.keys(filters).length);
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
});

describe('empty cluster rules table', () => {
  beforeEach(() => {
    // the flag tells not to fetch external federated modules
    window.CYPRESS_RUN = true;

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

  it('renders no recommendation message', () => {
    cy.get('[data-ouia-component-id="no-recommendations"]')
      .contains('The cluster is not affected by any known recommendations')
      .should('exist');
  });

  it('does not render table', () => {
    cy.get(TABLE).should('not.exist');
  });
});

// TODO what will happen if server fails to respond?

describe('cluster rules table testing the first query parameter', () => {
  beforeEach(() => {
    // the flag tells not to fetch external federated modules
    window.CYPRESS_RUN = true;

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
        cy.get(header).find('button').dblclick();
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
