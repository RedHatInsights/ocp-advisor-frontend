import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import _ from 'lodash';

import { RecsListTable } from './RecsListTable';
import getStore from '../../Store';
import ruleResponse from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule.json';
import { Intl } from '../../Utilities/intlHelper';
import {
  TOOLBAR,
  TOOLBAR_FILTER,
  CHIP,
  CHIP_GROUP,
  PAGINATION,
  TABLE,
} from '../../../cypress/utils/components';
import {
  hasChip,
  urlParamConvert,
  filter,
  applyFilters,
  removeAllChips,
} from '../../../cypress/utils/filters';
import {
  DEFAULT_ROW_COUNT,
  PAGINATION_VALUES,
} from '../../../cypress/utils/defaults';
import { cumulativeCombinations } from '../../../cypress/utils/combine';
import {
  checkPaginationTotal,
  checkPaginationValues,
  changePagination,
  itemsPerPage,
} from '../../../cypress/utils/pagination';
import { TOTAL_RISK, CATEGORIES } from '../../../cypress/utils/globals';
import { RECS_LIST_COLUMNS, RULE_CATEGORIES } from '../../AppConstants';
import {
  checkRowCounts,
  columnName2UrlParam,
  checkTableHeaders,
  tableIsSortedBy,
  checkEmptyState,
} from '../../../cypress/utils/table';
import { SORTING_ORDERS } from '../../../cypress/utils/globals';
// TODO make more use of ../../../cypress/utils/components

// selectors
const ROOT = 'div[id=recs-list-table]';
const ROW = 'tbody[role=rowgroup]'; // FIXME use ROW from components
// TODO refer to https://github.com/RedHatInsights/ocp-advisor-frontend/blob/master/src/Services/Filters.js#L13
const DEFAULT_FILTERS = {
  impacting: ['1 or more'],
  status: 'Enabled',
};
const TABLE_HEADERS = _.map(RECS_LIST_COLUMNS, (it) => it.title);

const data = ruleResponse.recommendations;

const IMPACT = { Low: 1, Medium: 2, High: 3, Critical: 4 };
const LIKELIHOOD = { Low: 1, Medium: 2, High: 3, Critical: 4 };
const STATUS = ['All', 'Enabled', 'Disabled'];
const IMPACTING = { '1 or more': 'true', None: 'false' };
const CATEGORIES_MAP = {
  'Service Availability': 1,
  Security: 4,
  'Fault Tolerance': 3,
  Performance: 2,
};

const filtersConf = {
  name: {
    selectorText: 'Name',
    values: ['lorem', '1lorem', 'Not existing recommendation'],
    type: 'input',
    filterFunc: (it, value) =>
      it.description.toLowerCase().includes(value.toLowerCase()),
    urlParam: 'text',
    urlValue: (it) => it.replace(/ /g, '+'),
  },
  risk: {
    selectorText: 'Total risk',
    values: Array.from(cumulativeCombinations(Object.keys(TOTAL_RISK))),
    type: 'checkbox',
    filterFunc: (it, value) =>
      _.map(value, (x) => TOTAL_RISK[x]).includes(it.total_risk),
    urlParam: 'total_risk',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => TOTAL_RISK[x]).join(',')),
  },
  impact: {
    selectorText: 'Impact',
    values: Array.from(cumulativeCombinations(Object.keys(IMPACT))),
    type: 'checkbox',
    filterFunc: (it, value) =>
      _.map(value, (x) => IMPACT[x]).includes(it.impact),
    urlParam: 'impact',
    urlValue: (it) => encodeURIComponent(_.map(it, (x) => IMPACT[x]).join(',')),
  },
  likelihood: {
    selectorText: 'Likelihood',
    values: Array.from(cumulativeCombinations(Object.keys(LIKELIHOOD))),
    type: 'checkbox',
    filterFunc: (it, value) =>
      _.map(value, (x) => LIKELIHOOD[x]).includes(it.likelihood),
    urlParam: 'likelihood',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => LIKELIHOOD[x]).join(',')),
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
    urlParam: 'category',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => CATEGORIES_MAP[x]).join(',')),
  },
  status: {
    selectorText: 'Status',
    values: STATUS,
    type: 'radio',
    filterFunc: (it, value) => {
      if (value === 'All') return true;
      else return it.disabled === (value === 'Disabled');
    },
    urlParam: 'rule_status',
    urlValue: (it) => it.toLowerCase(),
  },
  impacting: {
    selectorText: 'Clusters impacted',
    values: Array.from(cumulativeCombinations(Object.keys(IMPACTING))),
    type: 'checkbox',
    filterFunc: (it, value) => {
      if (!value.includes('1 or more') && it.impacted_clusters_count > 0)
        return false;
      if (!value.includes('None') && it.impacted_clusters_count === 0)
        return false;
      return true;
    },
    urlParam: 'impacting',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => IMPACTING[x]).join(',')),
  },
};

const filterData = (filters = DEFAULT_FILTERS) =>
  filter(filtersConf, data, filters);
const filterApply = (filters) => applyFilters(filters, filtersConf);

const DEFAULT_DISPLAYED_SIZE = Math.min(
  filterData(DEFAULT_FILTERS).length,
  DEFAULT_ROW_COUNT
);

const filterCombos = [{ impacting: ['1 or more'] }];

// actions
Cypress.Commands.add('getAllRows', () => cy.get(TABLE).find(ROW));
Cypress.Commands.add('removeStatusFilter', () => {
  cy.get(CHIP)
    .contains('Enabled')
    .parent()
    .find('button[data-ouia-component-id=close]')
    .click();
});
Cypress.Commands.add('removeImpactingFilter', () => {
  cy.get(CHIP)
    .contains('1 or more')
    .parent()
    .find('button[data-ouia-component-id=close]')
    .click();
});
Cypress.Commands.add('getRowByName', (name) => {
  cy.contains(ROW, name);
});
Cypress.Commands.add('clickOnRowKebab', (name) => {
  cy.contains(ROW, name).find('.pf-c-dropdown__toggle').click();
});
Cypress.Commands.add('getColumns', () => {
  /* patternfly/react-table-4.71.16, for some reason, renders extra empty `th` container;
       thus, it is necessary to look at the additional `scope` attr to distinguish between visible columns
  */
  cy.get(`${TABLE} > thead > tr > th[scope="col"]`);
});
Cypress.Commands.add('sortByCol', (colIndex) => {
  cy.getColumns()
    .eq(colIndex)
    .find('span[class=pf-c-table__sort-indicator]')
    .click({ force: true });
});

before(() => {
  // the flag tells not to fetch external federated modules
  window.CYPRESS_RUN = true;
});

// TODO test data

// TODO: when checking empty state, also check toolbar available and not disabled

describe('data', () => {
  it('has values', () => {
    expect(data).to.have.length.gte(1);
  });
  it('has values even with default filters', () => {
    expect(filterData(DEFAULT_FILTERS)).to.have.length.gte(1);
  });
  it('at least two recommendations match lorem for their descriptions', () => {
    expect(filterData({ name: 'lorem' })).to.have.length.gt(1);
  });
  it('only one recommendation matches 1Lorem in the description', () => {
    expect(filterData({ name: '1lorem' })).to.have.lengthOf(1);
  });
  it('the first combo filter different recommendations hitting that the default and at least one', () => {
    const filteredData = filterData(filterCombos[0]);
    expect(filteredData).to.have.length.gte(1);
    expect(filteredData).to.not.have.lengthOf(
      filterData(DEFAULT_FILTERS).length
    );
  });
  it('there is at least one disabled recommendation in the first page', () => {
    const firstData = filterData({}).slice(0, DEFAULT_ROW_COUNT);
    expect(_.filter(firstData, (it) => it.disabled)).to.have.length.gte(1);
  });
});

const urlParamsList = [
  'text=123|FOO_BAR&total_risk=4,3&impact=1,2&likelihood=1&category=1,2&rule_status=disabled&impacting=false',
  'total_risk=1&text=foo+bar&category=1&rule_status=disabled&impacting=false',
  'total_risk=2&text=foo&category=2&rule_status=enabled&impacting=true',
];

urlParamsList.forEach((urlParams, index) => {
  describe(`pre-filled url search parameters ${index}`, () => {
    beforeEach(() => {
      mount(
        <MemoryRouter
          initialEntries={[`/recommendations?${urlParams}`]}
          initialIndex={0}
        >
          <Intl>
            <Provider store={getStore()}>
              <RecsListTable
                query={{
                  isError: false,
                  isFetching: false,
                  isUninitialized: false,
                  isSuccess: true,
                  data: ruleResponse,
                }}
              />
            </Provider>
          </Intl>
        </MemoryRouter>
      );
    });

    it('recognizes all parameters', () => {
      const urlSearchParameters = new URLSearchParams(urlParams);
      for (const [key, value] of urlSearchParameters) {
        if (key == 'text') {
          hasChip('Name', value);
          cy.get('.pf-m-fill > .pf-c-form-control').should('have.value', value);
        } else {
          value.split(',').forEach((it) => {
            const [group, item] = urlParamConvert(key, it);
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

describe('successful non-empty recommendations list table', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter initialEntries={['/recommendations']} initialIndex={0}>
        <Intl>
          <Provider store={getStore()}>
            <RecsListTable
              query={{
                isError: false,
                isFetching: false,
                isUninitialized: false,
                isSuccess: true,
                data: ruleResponse,
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

  it('renders Clusters impacted chip group', () => {
    cy.get(ROOT)
      .find('span[class=pf-c-chip-group__label]')
      .should('have.length', 2)
      .eq(0)
      .and('have.text', 'Clusters impacted');
    cy.get(ROOT)
      .find('span[class=pf-c-chip-group__label]')
      .eq(1)
      .and('have.text', 'Status');
    cy.get(ROOT)
      .find('li[class=pf-c-chip-group__list-item]')
      .should('have.length', 2)
      .eq(0)
      .and('have.text', '1 or more');
    cy.get(ROOT)
      .find('li[class=pf-c-chip-group__list-item]')
      .eq(1)
      .and('have.text', 'Enabled');
  });

  it('Expected filters available', () => {
    const FILTERS_DROPDOWN = 'ul[class=pf-c-dropdown__menu]';
    const FILTER_ITEM = 'button[class=pf-c-dropdown__menu-item]';

    cy.get(ROOT)
      .should('have.length', 1)
      .find('button[class=pf-c-dropdown__toggle]')
      .should('have.length', 1)
      .click();
    const filtersNames = _.map(filtersConf, 'selectorText');
    cy.get(FILTERS_DROPDOWN)
      .find(FILTER_ITEM)
      .should('have.length', filtersNames.length);
    cy.get(FILTERS_DROPDOWN)
      .find(FILTER_ITEM)
      .each(($el) => expect($el.text()).to.be.oneOf(filtersNames));
  });

  describe('defaults', () => {
    it(`shows maximum ${DEFAULT_ROW_COUNT} recommendations`, () => {
      checkRowCounts(DEFAULT_DISPLAYED_SIZE);
      expect(window.location.search).to.contain(`limit=${DEFAULT_ROW_COUNT}`);
    });

    it(`pagination is set to ${DEFAULT_ROW_COUNT}`, () => {
      cy.get('.pf-c-options-menu__toggle-text')
        .find('b')
        .eq(0)
        .should('have.text', `1 - ${DEFAULT_DISPLAYED_SIZE}`);
    });

    it('sort by total risk', () => {
      const column = 'Total risk';
      tableIsSortedBy(column);
      expect(window.location.search).to.contain(
        `sort=-${columnName2UrlParam(column)}`
      );
    });

    it('applies filters', () => {
      for (const [key, value] of Object.entries(DEFAULT_FILTERS)) {
        const conf = filtersConf[key];
        if (conf.type === 'checkbox') {
          value.forEach((it) => {
            hasChip(conf.selectorText, it);
          });
        } else {
          hasChip(conf.selectorText, value);
        }

        expect(window.location.search).to.contain(
          `${conf.urlParam}=${conf.urlValue(value)}`
        );
      }
      // do not get more chips than expected
      cy.get(CHIP_GROUP).should(
        'have.length',
        Object.keys(DEFAULT_FILTERS).length
      );
    });

    it('reset filters button is displayed', () => {
      cy.get('button').contains('Reset filters').should('exist');
    });
  });

  describe('pagination', () => {
    it('shows correct total number of recommendations', () => {
      checkPaginationTotal(filterData(DEFAULT_FILTERS).length);
    });

    it('values are expected ones', () => {
      checkPaginationValues(PAGINATION_VALUES);
    });

    it('can change page limit', () => {
      // FIXME: best way to make the loop
      cy.wrap(PAGINATION_VALUES).each((el) => {
        changePagination(el).then(() =>
          expect(window.location.search).to.contain(`limit=${el}`)
        );
        checkRowCounts(Math.min(el, filterData(DEFAULT_FILTERS).length));
      });
    });
    it('can iterate over pages', () => {
      cy.wrap(itemsPerPage(filterData(DEFAULT_FILTERS).length)).each(
        (el, index, list) => {
          checkRowCounts(Math.min(el, filterData(DEFAULT_FILTERS).length)).then(
            () => {
              expect(window.location.search).to.contain(
                `offset=${DEFAULT_ROW_COUNT * index}`
              );
            }
          );
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
      [
        'description',
        'publish_date',
        'tags',
        'total_risk',
        'impacted_clusters_count',
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
                  `sort=${columnName2UrlParam(category)}`
                )
              );
          } else {
            cy.get(header)
              .find('button')
              .click()
              .click() // TODO dblclick fails for unknown reason
              .then(() =>
                expect(window.location.search).to.contain(
                  `sort=-${columnName2UrlParam(category)}`
                )
              );
          }
          let orderIteratee = category;
          if (category === 'tags') {
            orderIteratee = (it) =>
              _.first(
                it.tags.filter((string) =>
                  Object.keys(RULE_CATEGORIES).includes(string)
                )
              );
          }
          // add property name to clusters
          let sortedData = _.map(
            // all tables must preserve original ordering
            _.orderBy(
              _.cloneDeep(filterData(DEFAULT_FILTERS)),
              [orderIteratee],
              [order === 'ascending' ? 'asc' : 'desc']
            ),
            'description'
          );
          cy.get(`td[data-label="Name"]`)
            .then(($els) => {
              return _.map(Cypress.$.makeArray($els), 'innerText');
            })
            .should('deep.equal', sortedData.slice(0, DEFAULT_ROW_COUNT));
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
      // check default filters
      hasChip('Clusters impacted', '1 or more');
      hasChip('Status', 'Enabled');
      cy.get(CHIP_GROUP).should(
        'have.length',
        Object.keys(DEFAULT_FILTERS).length
      );
      cy.get('button').contains('Reset filters').should('exist');
      checkRowCounts(DEFAULT_DISPLAYED_SIZE);
    });

    it('empty state is displayed when filters do not match any rule', () => {
      removeAllChips();
      filterApply({
        name: 'Not existing recommendation',
      });
      checkEmptyState(
        'No matching recommendations found',
        'To continue, edit your filter settings and search again.'
      );
      checkTableHeaders(TABLE_HEADERS);
    });

    it('no filters show all recommendations', () => {
      removeAllChips();
      checkRowCounts(Math.min(DEFAULT_ROW_COUNT, data.length));
      checkPaginationTotal(data.length);
    });

    describe('single filter', () => {
      Object.entries(filtersConf).forEach(([k, v]) => {
        v.values.forEach((filterValues) => {
          it(`${k}: ${filterValues}`, () => {
            const filters = {};
            filters[k] = filterValues;
            let sortedNames = _.map(
              _.orderBy(
                _.cloneDeep(filterData(filters)),
                ['total_risk'],
                ['desc']
              ),
              'description'
            );
            removeAllChips();
            filterApply(filters);
            if (sortedNames.length === 0) {
              checkEmptyState(
                'No matching recommendations found',
                'To continue, edit your filter settings and search again.'
              );
              checkTableHeaders(TABLE_HEADERS);
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

    // TODO: add more combinations
    describe('combined filters', () => {
      filterCombos.forEach((filters) => {
        it(`${Object.keys(filters)}`, () => {
          let sortedNames = _.map(
            _.orderBy(
              _.cloneDeep(filterData(filters)),
              ['total_risk'],
              ['desc']
            ),
            'description'
          );
          removeAllChips();
          filterApply(filters);
          if (sortedNames.length === 0) {
            checkEmptyState(
              'No matching recommendations found',
              'To continue, edit your filter settings and search again.'
            );
            checkTableHeaders(TABLE_HEADERS);
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

    it('clears text input after Name filter chip removal', () => {
      filterApply({ name: 'cc' });
      // remove the chip
      cy.contains(CHIP_GROUP, 'Name')
        .find('button')
        .click()
        .then(() => {
          expect(window.location.search).to.not.contain('text=');
        });
      cy.get(TOOLBAR_FILTER).find('.pf-c-form-control').should('be.empty');
    });

    it('clears text input after resetting all filters', () => {
      filterApply({ name: 'cc' });
      // reset all filters
      cy.get(TOOLBAR)
        .find('button')
        .contains('Reset filters')
        .click()
        .then(() => {
          expect(window.location.search).to.not.contain('text=');
        });
      cy.get(TOOLBAR_FILTER).find('.pf-c-form-control').should('be.empty');
    });
  });

  describe('enabling/disabling', () => {
    it('disabled rule has a label', () => {
      cy.removeStatusFilter();
      checkRowCounts(5);
      cy.getRowByName('disabled rule with 2 impacted')
        .children()
        .eq(0)
        .children()
        .eq(1)
        .find('span[class=pf-c-label__content]')
        .should('have.text', 'Disabled');
    });

    it('each row has a kebab', () => {
      cy.get(TABLE)
        .find('tbody[role=rowgroup] .pf-c-dropdown__toggle')
        .should('have.length', DEFAULT_DISPLAYED_SIZE);
    });

    it('enabled rule has the disable action', () => {
      cy.clickOnRowKebab(
        'Super atomic nuclear cluster on the brink of the world destruction'
      );
      cy.getRowByName(
        'Super atomic nuclear cluster on the brink of the world destruction'
      )
        .find('.pf-c-dropdown__menu button')
        .should('have.text', 'Disable recommendation');
    });

    it('disabled rule has the enable action', () => {
      removeAllChips();
      const firstDisabledRecommendation = _.filter(
        filterData({}),
        (it) => it.disabled
      )[0];
      cy.clickOnRowKebab(firstDisabledRecommendation.description);
      cy.getRowByName(firstDisabledRecommendation.description)
        .find('.pf-c-dropdown__menu button')
        .should('have.text', 'Enable recommendation');
    });
  });

  it('rule content is rendered', () => {
    // expand all rules
    cy.get('.pf-c-toolbar__expand-all-icon > svg').click();
    cy.get(TABLE)
      .find('.pf-c-table__expandable-row.pf-m-expanded')
      .each((el) => {
        // contains description
        cy.wrap(el).contains(
          'Sed ut perspiciatis unde omnis iste natus error.'
        );
        // contain total risk label
        cy.wrap(el).find('.ins-c-rule-details__stack');
      });
  });
});

describe('empty recommendations list table', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter initialEntries={['/recommendations']} initialIndex={0}>
        <Intl>
          <Provider store={getStore()}>
            <RecsListTable
              query={{
                isError: false,
                isFetching: false,
                isUninitialized: false,
                isSuccess: true,
                data: { recommendations: [], status: 'ok' },
              }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('renders error message', () => {
    checkEmptyState(
      'Something went wrong',
      'There was a problem processing the request. Please try again.If the problem persists, contact Red Hat Support or check our  status page for known outages.',
      true
    ); // error is shown because it is not OK if API responds 200 but with no recommendations
  });
});

describe('error recommendations list table', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter initialEntries={['/recommendations']} initialIndex={0}>
        <Intl>
          <Provider store={getStore()}>
            <RecsListTable
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

  it('renders error message', () => {
    checkEmptyState(
      'Something went wrong',
      'There was a problem processing the request. Please try again.If the problem persists, contact Red Hat Support or check our  status page for known outages.',
      true
    );
  });
});
