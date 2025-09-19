import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import _ from 'lodash';

import { RecsListTable } from './RecsListTable';
import getStore from '../../Store';
import ruleResponse from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule.json';
import { Intl } from '../../Utilities/intlHelper';
// TODO: use cypress utils from FEC
import {
  TOOLBAR_FILTER,
  ROWS_TOGGLER,
} from '../../../cypress/utils/components';
import { applyFilters } from '../../../cypress/utils/filters';
import {
  DEFAULT_ROW_COUNT,
  PAGINATION_VALUES,
} from '../../../cypress/utils/defaults';
import { cumulativeCombinations } from '../../../cypress/utils/combine';
import {
  checkCurrentPage,
  checkPaginationSelected,
  itemsPerPage,
} from '../../../cypress/utils/pagination';
import { TOTAL_RISK, CATEGORIES } from '../../../cypress/utils/globals';
import {
  FILTER_CATEGORIES,
  RECS_LIST_COLUMNS,
  RULE_CATEGORIES,
} from '../../AppConstants';
import {
  checkRowGroupCounts,
  checkNoMatchingRecs,
  checkFiltering,
  checkSorting,
} from '../../../cypress/utils/table';

import {
  TOOLBAR,
  CHIP,
  CHIP_GROUP,
  PAGINATION,
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
  checkEmptyState,
  TABLE_ROW,
} from '@redhat-cloud-services/frontend-components-utilities';

import { SORTING_ORDERS } from '../../../cypress/utils/globals';
// TODO make more use of ../../../cypress/utils/components

// selectors
const ROOT = 'div[id=recs-list-table]';
const ROW = 'tbody[role=rowgroup]'; // FIXME use ROW from components
const EXPANDABLES = '[class*="pf-v5-c-table__expandable-row pf-m-expanded"]';
// TODO refer to https://github.com/RedHatInsights/ocp-advisor-frontend/blob/master/src/Services/Filters.js#L13
const DEFAULT_FILTERS = {
  impacting: ['1 or more'],
  status: 'Enabled',
};
const TABLE_HEADERS = _.map(RECS_LIST_COLUMNS, (it) => it.title);

let values = ruleResponse.recommendations;
const dataUnsorted = _.cloneDeep(values);
const data = _.orderBy(values, ['total_risk'], ['desc']);

const IMPACT = { Low: 1, Medium: 2, High: 3, Critical: 4 };
const LIKELIHOOD = { Low: 1, Medium: 2, High: 3, Critical: 4 };
const RISK_OF_CHANGE = { 'Very Low': 1, Low: 2, Moderate: 3, High: 4 };
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
  res_risk: {
    selectorText: 'Risk of change',
    values: Array.from(cumulativeCombinations(Object.keys(RISK_OF_CHANGE))),
    type: 'checkbox',
    filterFunc: (it, value) =>
      _.map(value, (x) => RISK_OF_CHANGE[x]).includes(it.resolution_risk),
    urlParam: 'res_risk',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => RISK_OF_CHANGE[x]).join(',')),
  },
  category: {
    selectorText: 'Category',
    values: Array.from(cumulativeCombinations(Object.keys(CATEGORIES))),
    type: 'checkbox',
    filterFunc: (it, value) =>
      _.intersection(
        _.flatMap(value, (x) => CATEGORIES[x]),
        it.tags,
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

const filterData = (filters = DEFAULT_FILTERS, values = data) =>
  filter(filtersConf, values, filters);
const filterApply = (filters) => applyFilters(filters, filtersConf);

const DEFAULT_DISPLAYED_SIZE = Math.min(
  filterData(DEFAULT_FILTERS).length,
  DEFAULT_ROW_COUNT,
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
  cy.contains(ROW, name).find('.pf-v5-c-menu-toggle').click();
});
Cypress.Commands.add('getColumns', () => {
  /* patternfly/react-table-4.71.16, for some reason, renders extra empty `th` container;
             thus, it is necessary to look at the additional `scope` attr to distinguish between visible columns
        */
  cy.get(`${TABLE} > thead > tr > th[scope="col"]`);
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
    expect(filterData()).to.have.length.gte(1);
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
    expect(filteredData).to.not.have.lengthOf(filterData().length);
  });
  it('there is at least one disabled recommendation in the first page', () => {
    const firstData = filterData({}).slice(0, DEFAULT_ROW_COUNT);
    expect(_.filter(firstData, (it) => it.disabled)).to.have.length.gte(1);
  });
  it('at least one recommendation in default list has only 1 cluster hit', () => {
    expect(
      _.filter(filterData(), (it) => it.impacted_clusters_count === 1),
    ).to.have.length.gte(1);
  });
  it('at least one recommendation in default list has more than 1 cluster hit', () => {
    expect(
      _.filter(filterData(), (it) => it.impacted_clusters_count > 1),
    ).to.have.length.gte(1);
  });
  it('at least one rule has no affecting clutsers', () => {
    expect(
      filterData({
        impacting: ['None'],
      }),
      (it) => it.impacted_clusters_count === 0,
    ).to.have.length.gte(1);
  });
  it('at least one recommendation in default list has resolution risk set to non 0 value', () => {
    expect(
      filterData().filter(
        ({ resolution_risk, description }) =>
          resolution_risk >= 1 &&
          description.includes('1Lorem ipsum dolor sit amet'),
      ).length,
    ).to.gte(1);
  });
  it('at least one recommendation in default list has resolution risk set to 0', () => {
    expect(
      filterData().filter(
        ({ resolution_risk, description }) =>
          resolution_risk === 0 && description.includes('Super atomic nuclear'),
      ).length,
    ).to.gte(1);
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
      cy.mount(
        <MemoryRouter
          initialEntries={[
            `/openshift/insights/advisor/recommendations?${urlParams}`,
          ]}
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
        </MemoryRouter>,
      );
    });

    it('recognizes all parameters', () => {
      const urlSearchParameters = new URLSearchParams(urlParams);
      for (const [key, value] of urlSearchParameters) {
        if (key == 'text') {
          hasChip('Name', value);
          cy.get(
            '.pf-m-fill [data-ouia-component-type="PF5/TextInput"]',
          ).should('have.value', value);
        } else {
          value.split(',').forEach((it) => {
            const [group, item] = urlParamConvert(key, it, FILTER_CATEGORIES);
            hasChip(group, item);
          });
        }
      }
      // do not get more chips than expected
      cy.get(CHIP_GROUP).should(
        'have.length',
        Array.from(urlSearchParameters).length,
      );
    });
  });
});

describe('successful non-empty recommendations list table', () => {
  beforeEach(() => {
    cy.mount(
      <MemoryRouter
        initialEntries={['/openshift/insights/advisor/recommendations']}
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
                refetch: cy.stub(),
              }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>,
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
    hasChip('Clusters impacted', '1 or more');
    hasChip('Status', 'Enabled');
  });

  it('Expected filters available', () => {
    const FILTERS_DROPDOWN = 'ul[class=pf-v5-c-menu__list]';
    const FILTER_ITEM = 'button[class=pf-v5-c-menu__item]';

    cy.get(ROOT)
      .should('have.length', 1)
      .find(
        'button[class*="pf-v5-c-menu-toggle ins-c-conditional-filter__group"]',
      )
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
      checkRowGroupCounts(DEFAULT_DISPLAYED_SIZE);
      expect(window.location.search).to.contain(`limit=${DEFAULT_ROW_COUNT}`);
    });

    it(`pagination is set to ${DEFAULT_ROW_COUNT}`, () => {
      cy.get('.pf-v5-c-menu-toggle__text')
        .find('b')
        .eq(0)
        .should('have.text', `1 - ${DEFAULT_DISPLAYED_SIZE}`);
    });

    it('sort by total risk', () => {
      const column = 'Total risk';
      tableIsSortedBy(column);
      expect(window.location.search).to.contain(
        `sort=-${columnName2UrlParam(column)}`,
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
          `${conf.urlParam}=${conf.urlValue(value)}`,
        );
      }
      // do not get more chips than expected
      cy.get(CHIP_GROUP).should(
        'have.length',
        Object.keys(DEFAULT_FILTERS).length,
      );
    });

    it('reset filters button is displayed', () => {
      cy.get('button').contains('Reset filters').should('exist');
    });
  });

  it('expand all, collapse all', () => {
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
    cy.get(ROWS_TOGGLER).click();
    cy.get(EXPANDABLES).should('have.length', DEFAULT_DISPLAYED_SIZE);
    cy.get(ROWS_TOGGLER).click();
    cy.get(EXPANDABLES).should('have.length', 0);
  });

  describe('pagination', () => {
    it('shows correct total number of recommendations', () => {
      checkPaginationTotal(filterData().length);
    });

    it('values are expected ones', () => {
      checkPaginationValues(PAGINATION_VALUES);
    });

    it('can change page limit', () => {
      // FIXME: best way to make the loop
      cy.wrap(PAGINATION_VALUES).each((el) => {
        changePagination(el).then(() => {
          expect(window.location.search).to.contain(`limit=${el}`);
          checkRowGroupCounts(Math.min(el, filterData().length));
        });
      });
    });
    it('can iterate over pages', () => {
      cy.wrap(itemsPerPage(filterData().length)).each((el, index, list) => {
        checkRowGroupCounts(Math.min(el, filterData().length)).then(() => {
          expect(window.location.search).to.contain(
            `offset=${DEFAULT_ROW_COUNT * index}`,
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
        'description',
        'publish_date',
        'tags',
        'total_risk',
        'resolution_risk',
        'impacted_clusters_count',
      ],
      TABLE_HEADERS,
    ).forEach(([category, label]) => {
      SORTING_ORDERS.forEach((order) => {
        it(`${order} by ${label}`, () => {
          let sortingParameter = category;
          // modify sortingParameters for certain values

          if (category === 'tags') {
            sortingParameter = (it) =>
              _.first(
                it.tags.filter((string) =>
                  Object.keys(RULE_CATEGORIES).includes(string),
                ),
              );
          }

          checkSorting(
            filterData(DEFAULT_FILTERS, dataUnsorted),
            sortingParameter,
            label,
            order,
            'Name',
            'description',
            DEFAULT_DISPLAYED_SIZE,
            label === 'Risk of change' ? 'res_risk' : label,
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
        Object.keys(filterCombos[0]).length,
      );
      cy.get(CHIP_GROUP).should('exist');
      // clear filters
      cy.get('button').contains('Reset filters').click();
      // check default filters
      hasChip('Clusters impacted', '1 or more');
      hasChip('Status', 'Enabled');
      cy.get(CHIP_GROUP).should(
        'have.length',
        Object.keys(DEFAULT_FILTERS).length,
      );
      cy.get('button').contains('Reset filters').should('exist');
      checkRowGroupCounts(DEFAULT_DISPLAYED_SIZE);
    });

    it('empty state is displayed when filters do not match any rule', () => {
      removeAllChips();
      filterApply({
        name: 'Not existing recommendation',
      });
      checkNoMatchingRecs();
      checkTableHeaders(TABLE_HEADERS);
    });

    it('no filters show all recommendations', () => {
      removeAllChips();
      checkRowGroupCounts(Math.min(DEFAULT_ROW_COUNT, data.length));
      checkPaginationTotal(data.length);
    });

    describe('single filter', () => {
      Object.entries(filtersConf).forEach(([k, v]) => {
        v.values.forEach((filterValues) => {
          it(`${k}: ${filterValues}`, () => {
            // disabled recommendations have Disabled in their names
            let modifiedData = _.cloneDeep(data);
            modifiedData.forEach((it) => {
              if (it.disabled) {
                it.description = it.description + ' \nDisabled';
              }
            });
            const filters = { [k]: filterValues };
            checkFiltering(
              filters,
              filtersConf,
              _.map(filterData(filters, modifiedData), 'description').slice(
                0,
                DEFAULT_ROW_COUNT,
              ),
              'Name',
              TABLE_HEADERS,
              'No matching recommendations found',
              true,
              true,
            );
          });
        });
      });
    });

    // TODO: add more combinations
    describe('combined filters', () => {
      filterCombos.forEach((filters) => {
        it(`${Object.keys(filters)}`, () => {
          // disabled recommendations have Disabled in their names
          let modifiedData = _.cloneDeep(data);
          modifiedData.forEach((it) => {
            if (it.disabled) {
              it.description = it.description + ' \nDisabled';
            }
          });
          checkFiltering(
            filters,
            filtersConf,
            _.map(filterData(filters, modifiedData), 'description').slice(
              0,
              DEFAULT_ROW_COUNT,
            ),
            'Name',
            TABLE_HEADERS,
            'No matching recommendations found',
            true,
            true,
          );
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
      cy.get(TOOLBAR_FILTER)
        .find('.pf-v5-c-form-control > input')
        .should('be.empty');
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
      cy.get(TOOLBAR_FILTER)
        .find('.pf-v5-c-form-control > input')
        .should('be.empty');
    });

    it('will reset filters but not pagination and sorting', () => {
      filterApply({ name: '2' });
      changePagination(PAGINATION_VALUES[0]);

      cy.get('th[data-label="Name"]').find('button').click();
      cy.get(TOOLBAR).find('button').contains('Reset filters').click();
      cy.get(TOOLBAR)
        .find(CHIP_GROUP)
        .should('have.length', Object.keys(DEFAULT_FILTERS).length);
      checkPaginationSelected(0);
      checkCurrentPage(1);
      cy.get('th[data-label="Name"]')
        .should('have.attr', 'aria-sort')
        .and('contain', 'ascending');
    });

    it('absent resolution risk is shown as not available', () => {
      cy.getRowByName(
        'Super atomic nuclear cluster on the brink of the world destruction',
      )
        .find('[data-label="Risk of change"]')
        .should('have.text', 'Not available');
    });

    it('absent resolution risk is not shown in expanded details', () => {
      cy.getRowByName(
        'Super atomic nuclear cluster on the brink of the world destruction',
      )
        .find('.pf-v5-c-table__toggle button')
        .click();
      cy.get(EXPANDABLES)
        .eq(0)
        .find('.pf-m-spacer-sm')
        .contains('Risk of change')
        .should('not.exist');
    });

    it('present resolution risk is shown in expanded details', () => {
      cy.getRowByName('1Lorem ipsum dolor sit amet')
        .find('.pf-v5-c-table__toggle button')
        .click();
      cy.get(EXPANDABLES)
        .eq(0)
        .find('.pf-m-spacer-sm')
        .contains('Risk of change')
        .should('exist');
      cy.get(EXPANDABLES)
        .eq(0)
        .find('.ins-c-rule-details__risk-of-ch-label')
        .should('have.text', 'High');
    });

    it('view affected link is present for rules affecting at least one cluster', () => {
      cy.getRowByName(
        'Super atomic nuclear cluster on the brink of the world destruction',
      )
        .find('[aria-label="Details"]')
        .click();
      cy.get(EXPANDABLES)
        .first()
        .contains(/View [\d\w,]* affected clusters/);
    });

    it('view affected link is missing for non-affecting rules', () => {
      removeAllChips();
      filterApply({
        impacting: ['None'],
      });
      cy.get(TABLE_ROW).first().find('[aria-label="Details"]').click();
      cy.get(EXPANDABLES)
        .first()
        .contains(/View [\d\w,]* affected clusters/)
        .should('not.exist');
    });
  });

  describe('enabling/disabling', () => {
    it('disabled rule has a label', () => {
      removeAllChips();
      filterApply({ status: 'Disabled' });
      // according to data specs there should be at least 1 disabled row
      cy.get(`td[data-label="Name"]`).then(($els) => {
        cy.wrap($els).each(($el) => {
          cy.wrap($el)
            .find('span[class=pf-v5-c-label__content]')
            .should('have.text', 'Disabled');
        });
      });
    });

    it('each row has a kebab', () => {
      cy.get(TABLE)
        .find('tbody[role=rowgroup] .pf-v5-c-menu-toggle')
        .should('have.length', DEFAULT_DISPLAYED_SIZE);
    });

    it('enabled rule has the disable action', () => {
      cy.clickOnRowKebab(
        'Super atomic nuclear cluster on the brink of the world destruction',
      );
      cy.getRowByName(
        'Super atomic nuclear cluster on the brink of the world destruction',
      )
        .find('[data-ouia-component-type="PF5/DropdownItem"]')
        .should('have.text', 'Disable recommendation');
    });

    it('disabled rule has the enable action', () => {
      removeAllChips();
      const firstDisabledRecommendation = _.filter(
        filterData({}),
        (it) => it.disabled,
      )[0];
      cy.clickOnRowKebab(firstDisabledRecommendation.description);
      cy.getRowByName(firstDisabledRecommendation.description)
        .find('[data-ouia-component-type="PF5/DropdownItem"]')
        .should('have.text', 'Enable recommendation');
    });
  });

  it('rule content is rendered', () => {
    const recommendationList = filterData();
    cy.get(ROWS_TOGGLER).click();
    cy.get(TABLE)
      // .find('.pf-v5-c-table__expandable-row.pf-m-expanded')
      .find('.pf-v5-c-table__tbody.pf-m-expanded')
      .each((el, index) => {
        // contains description
        cy.wrap(el).contains(
          'Sed ut perspiciatis unde omnis iste natus error.',
        );
        // contain total risk label
        cy.wrap(el).find('.ins-c-rule-details__stack');
        // contains link to the clusters
        const recommendationData = recommendationList[index];
        cy.wrap(el)
          .find('a')
          .should(
            'have.attr',
            'href',
            `/openshift/insights/advisor/recommendations/${recommendationData.rule_id}`,
          );
        cy.wrap(el).and(($a) => {
          expect($a).to.contains.text(
            // toLocaleString() method is used to put comma in the thousands
            `${recommendationData.impacted_clusters_count.toLocaleString()}`,
          );
        });
      });
  });
});

describe('empty recommendations list table', () => {
  beforeEach(() => {
    cy.mount(
      <MemoryRouter
        initialEntries={['/openshift/insights/advisor/recommendations']}
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
                data: { recommendations: [], status: 'ok' },
              }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>,
    );
  });

  it('renders error message', () => {
    checkEmptyState('Something went wrong', true); // error is shown because it is not OK if API responds 200 but with no recommendations
  });
});

describe('error recommendations list table', () => {
  beforeEach(() => {
    cy.mount(
      <MemoryRouter
        initialEntries={['/openshift/insights/advisor/recommendations']}
        initialIndex={0}
      >
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
      </MemoryRouter>,
    );
  });

  it('renders error message', () => {
    checkEmptyState('Something went wrong', true);
  });
});
