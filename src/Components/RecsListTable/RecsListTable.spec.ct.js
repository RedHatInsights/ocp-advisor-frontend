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
} from '../../../cypress/utils/components';
import { hasChip, urlParamConvert } from '../../../cypress/utils/filters';
import {
  DEFAULT_ROW_COUNT,
  PAGINATION_VALUES,
} from '../../../cypress/utils/defaults';
import {
  checkPaginationTotal,
  checkPaginationValues,
  changePagination,
  itemsPerPage,
} from '../../../cypress/utils/pagination';
import { TOTAL_RISK, CATEGORIES } from '../../../cypress/utils/globals';
import {
  checkRowCounts,
  columnName2UrlParam,
} from '../../../cypress/utils/table';
// TODO make more use of ../../../cypress/utils/components

// selectors
const ROOT = 'div[id=recs-list-table]';
const ROW = 'tbody[role=rowgroup]'; // FIXME use ROW from components
const FILTERS_DROPDOWN = 'ul[class=pf-c-dropdown__menu]';
const FILTER_TOGGLE = 'span[class=pf-c-select__toggle-arrow]';
// TODO refer to https://github.com/RedHatInsights/ocp-advisor-frontend/blob/master/src/Services/Filters.js#L13
const DEFAULT_FILTERS = {
  impacting: true,
  rule_status: 'enabled',
};

const data = ruleResponse.recommendations;

function filterData(filters) {
  let filteredData = data;
  for (const [key, value] of Object.entries(filters)) {
    if (key === 'description') {
      filteredData = _.filter(filteredData, (it) =>
        it.description.toLowerCase().includes(value.toLowerCase())
      );
    } else if (key === 'risk') {
      const riskNumbers = _.map(value, (it) => TOTAL_RISK[it]);
      filteredData = _.filter(filteredData, (it) =>
        riskNumbers.includes(it.total_risk)
      );
    } else if (key === 'category') {
      const tags = _.flatMap(value, (it) => CATEGORIES[it]);
      filteredData = _.filter(
        filteredData,
        (it) => _.intersection(tags, it.tags).length > 0
      );
    } else if (key === 'rule_status' && value !== 'all') {
      const allowDisabled = value === 'disabled';
      filteredData = _.filter(
        filteredData,
        (it) => it.disabled === allowDisabled
      );
    } else if (key === 'impacting') {
      // TODO if value is true,false skip
      if (value) {
        filteredData = _.filter(
          filteredData,
          (it) => it.impacted_clusters_count > 0
        );
      } else {
        filteredData = _.filter(
          filteredData,
          (it) => it.impacted_clusters_count === 0
        );
      }
    }
    // if length is already 0, exit
    if (filteredData.length === 0) {
      break;
    }
  }
  return filteredData;
}

const DEFAULT_DISPLAYED_SIZE = Math.min(
  filterData(DEFAULT_FILTERS).length,
  DEFAULT_ROW_COUNT
);

// actions
Cypress.Commands.add('getAllRows', () => cy.get(ROOT).find(ROW));
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
  cy.get(ROOT).find('table > thead > tr > th[scope="col"]');
});
Cypress.Commands.add('sortByCol', (colIndex) => {
  cy.getColumns()
    .eq(colIndex)
    .find('span[class=pf-c-table__sort-indicator]')
    .click({ force: true });
});
const getChipGroup = (label) =>
  cy.contains('.pf-c-chip-group__label', label).parent();

before(() => {
  // the flag tells not to fetch external federated modules
  window.CYPRESS_RUN = true;
});

// TODO test data

const urlParams =
  'text=123|FOO_BAR&total_risk=4,3&impact=1,2&likelihood=1&category=1,2&rule_status=disabled&impacting=false';

describe('pre-filled url search parameters', () => {
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
      cy.get('table').should('have.length', 1);
    });
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

  it('7 filters available', () => {
    const FILTERS_DROPDOWN = 'ul[class=pf-c-dropdown__menu]';
    const FILTER_ITEM = 'button[class=pf-c-dropdown__menu-item]';

    cy.get(ROOT)
      .should('have.length', 1)
      .find('button[class=pf-c-dropdown__toggle]')
      .should('have.length', 1)
      .click();
    cy.get(FILTERS_DROPDOWN).find(FILTER_ITEM).should('have.length', 7);
    cy.get(FILTERS_DROPDOWN)
      .find(FILTER_ITEM)
      .each(($el) =>
        expect($el.text()).to.be.oneOf([
          'Name',
          'Total risk',
          'Impact',
          'Likelihood',
          'Category',
          'Clusters impacted',
          'Status',
        ])
      );
  });

  // TODO do not hardcode data
  it('table has 4 recs', () => {
    checkRowCounts(ROOT, 4);
  });

  // TODO do not hardcode data
  it('table has 7 recs including non-impacting', () => {
    cy.removeImpactingFilter();
    checkRowCounts(ROOT, 7);
  });

  // TODO do not hardcode data
  it('should have 5 sortable columns', () => {
    cy.getColumns()
      .should('have.length', 5)
      .should('have.class', 'pf-c-table__sort');
  });

  describe('defaults', () => {
    // TODO enhance tests See ClustersListTable

    it(`shows maximum ${DEFAULT_ROW_COUNT} recommendations`, () => {
      checkRowCounts(ROOT, DEFAULT_DISPLAYED_SIZE);
      expect(window.location.search).to.contain(`limit=${DEFAULT_ROW_COUNT}`);
    });

    it('default sort by total risk', () => {
      const column = 'Total risk';
      cy.get(ROOT)
        .find(`th[data-label="${column}"]`)
        .should('have.class', 'pf-c-table__sort pf-m-selected');
      expect(window.location.search).to.contain(
        `sort=-${columnName2UrlParam(column)}`
      );
    });

    it(`pagination is set to ${DEFAULT_ROW_COUNT}`, () => {
      cy.get('.pf-c-options-menu__toggle-text')
        .find('b')
        .eq(0)
        .should('have.text', `1 - ${DEFAULT_DISPLAYED_SIZE}`);
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
        checkRowCounts(ROOT, Math.min(el, filterData(DEFAULT_FILTERS).length));
      });
    });
    it('can iterate over pages', () => {
      cy.wrap(itemsPerPage(filterData(DEFAULT_FILTERS).length)).each(
        (el, index, list) => {
          checkRowCounts(
            ROOT,
            Math.min(el, filterData(DEFAULT_FILTERS).length)
          ).then(() => {
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
        }
      );
    });
  });

  describe('sorting', () => {
    // TODO make sorting tests data independent
    it('sort the data by Name', () => {
      cy.sortByCol(0).then(() => {
        expect(window.location.search).to.contain('sort=description');
      });
      cy.getAllRows()
        .eq(0)
        .find('td[data-label=Name]')
        .should('contain', '1Lorem');
      cy.sortByCol(0).then(() => {
        expect(window.location.search).to.contain('sort=-description');
      });
      cy.getAllRows()
        .eq(0)
        .find('td[data-label=Name]')
        .should(
          'contain',
          'Super atomic nuclear cluster on the brink of the world destruction'
        );

      // all tables must preserve original ordering
      it('can sort by category', () => {
        cy.sortByCol(2).then(() => {
          expect(window.location.search).to.contain('sort=tags');
        });
        cy.getAllRows()
          .eq(0)
          .find('td[data-label=Name]')
          .should('contain', '1Lorem');
        cy.getAllRows()
          .eq(0)
          .find('td[data-label=Category]')
          .should('contain', 'Performance');
        cy.sortByCol(2).then(() => {
          expect(window.location.search).to.contain('sort=-tags');
        });
        cy.getAllRows()
          .eq(0)
          .find('td[data-label=Category]')
          .should('contain', 'Performance');
      });
    });

    it('sort the data by Modified', () => {
      cy.sortByCol(1).then(() => {
        expect(window.location.search).to.contain('sort=publish_date');
      });
      cy.getAllRows()
        .eq(0)
        .find('td[data-label=Name]')
        .should('contain', '1Lorem');
      cy.sortByCol(1).then(() => {
        expect(window.location.search).to.contain('sort=-publish_date');
      });
      cy.getAllRows()
        .eq(0)
        .find('td[data-label=Name]')
        .should(
          'contain',
          'Super atomic nuclear cluster on the brink of the world destruction'
        );
    });

    //had to add \\ \\ to the Total risk, otherwise jQuery engine would throw an error
    it('sort the data by Total Risk', () => {
      cy.sortByCol(3).then(() => {
        expect(window.location.search).to.contain('sort=total_risk');
      });
      cy.getAllRows()
        .eq(0)
        .find('td[data-label="Total risk"]')
        .should('contain', 'Moderate');
      cy.sortByCol(3).then(() => {
        expect(window.location.search).to.contain('sort=-total_risk');
      });
      cy.getAllRows()
        .eq(0)
        .find('td[data-label="Total risk"]')
        .should('contain', 'Critical');
    });

    it('sort the data by Clusters', () => {
      cy.sortByCol(4).then(() => {
        expect(window.location.search).to.contain(
          'sort=impacted_clusters_count'
        );
      });
      cy.getAllRows()
        .eq(0)
        .find('td[data-label="Clusters"]')
        .should('contain', '1');
      cy.sortByCol(4).then(() => {
        expect(window.location.search).to.contain(
          'sort=-impacted_clusters_count'
        );
      });
      cy.getAllRows()
        .eq(0)
        .find('td[data-label="Clusters"]')
        .should('contain', '2,003');
    });
  });

  describe('filtering', () => {
    it('include disabled rules', () => {
      cy.removeStatusFilter().then(() => {
        expect(window.location.search).to.not.contain('rule_status');
      });
      // TODO Verify that rule is in data as disabled
      checkRowCounts(ROOT, 5)
        .find('td[data-label="Name"]')
        .contains('disabled rule with 2 impacted')
        .should('have.length', 1);
      // TODO make test data agnostic as long as one disabled rule is present
    });

    it('the Impacted filters work correctly', () => {
      cy.get(ROOT).find('button[class=pf-c-dropdown__toggle]').click();
      cy.get(FILTERS_DROPDOWN).contains('Clusters impacted').click();
      cy.get(FILTER_TOGGLE).then((element) => {
        cy.wrap(element);
        element[0].click();
      });
      cy.get('.pf-c-select__menu')
        .find('label > input')
        .eq(1)
        .check()
        .then(() => {
          expect(window.location.search).to.contain('impacting=true%2Cfalse');
        });
      cy.get('.pf-c-chip-group__list-item').contains('1 or more');

      cy.get(ROOT).find('button[class=pf-c-dropdown__toggle]').click();
      cy.get(FILTERS_DROPDOWN).contains('Status').click();
      cy.get(FILTER_TOGGLE).click({ force: true });
      cy.get('button[class=pf-c-select__menu-item]')
        .contains('All')
        .click()
        .then(() => {
          expect(window.location.search).to.contain('rule_status=all');
        });
      cy.get('.pf-c-chip-group__list-item').contains('1 or more');
    });

    it('clears text input after Name filter chip removal', () => {
      cy.get(TOOLBAR_FILTER)
        .find('.pf-c-form-control')
        .type('cc')
        .then(() => {
          expect(window.location.search).to.contain('text=cc');
        });
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
      cy.get(TOOLBAR_FILTER).find('.pf-c-form-control').type('cc');
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
      checkRowCounts(ROOT, 5);
      cy.getRowByName('disabled rule with 2 impacted')
        .children()
        .eq(0)
        .children()
        .eq(1)
        .find('span[class=pf-c-label__content]')
        .should('have.text', 'Disabled');
    });

    // TODO make test data independent
    // TODO check also non-enabled by default rules
    it('each row has a kebab', () => {
      cy.get(ROOT)
        .find('tbody[role=rowgroup] .pf-c-dropdown__toggle')
        .should('have.length', 4);
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

    // TODO make test data agnostic
    it('disabled rule has the enable action', () => {
      cy.removeStatusFilter();
      cy.removeImpactingFilter();
      cy.clickOnRowKebab('disabled rule with 2 impacted');
      cy.getRowByName('disabled rule with 2 impacted')
        .find('.pf-c-dropdown__menu button')
        .should('have.text', 'Enable recommendation');
    });
  });

  it('rule content is rendered', () => {
    // expand all rules
    cy.get('.pf-c-toolbar__expand-all-icon > svg').click();
    cy.get(ROOT)
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

  // TODO: test search parameters with likelihood, impact, category filters
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
    cy.get('#error-state-message')
      .find('h4')
      .should('have.text', 'Something went wrong');
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
    cy.get('#error-state-message')
      .find('h4')
      .should('have.text', 'Something went wrong');
  });
});

describe('Recs list is requested with additional parameters №1', () => {
  before(() => {
    mount(
      <MemoryRouter
        initialEntries={[
          '/recommendations?total_risk=1&text=foo+bar&category=1&rule_status=disabled&impacting=false',
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
      </MemoryRouter>
    );
  });

  it('Adds first iteration of filters to the table', () => {
    cy.get(ROOT)
      .find('span[class=pf-c-chip-group__label]')
      .should('have.length', 5);
    getChipGroup('Total risk').contains('.pf-c-chip', 'Low');
    getChipGroup('Name').contains('.pf-c-chip', 'foo bar');
    getChipGroup('Category').contains('.pf-c-chip', 'Service Availability');
    getChipGroup('Status').contains('.pf-c-chip', 'Disabled');
    getChipGroup('Clusters impacted').contains('.pf-c-chip', 'None');
  });
});

describe('Recs list is requested with additional parameters №2', () => {
  before(() => {
    mount(
      <MemoryRouter
        initialEntries={[
          '/recommendations?total_risk=2&text=foo+bar&category=2&rule_status=enabled&impacting=true',
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
      </MemoryRouter>
    );
  });

  it('Adds second iteration of filters to the table', () => {
    cy.get(ROOT)
      .find('span[class=pf-c-chip-group__label]')
      .should('have.length', 5);
    getChipGroup('Total risk').contains('.pf-c-chip', 'Moderate');
    getChipGroup('Name').contains('.pf-c-chip', 'foo bar');
    getChipGroup('Category').contains('.pf-c-chip', 'Performance');
    getChipGroup('Status').contains('.pf-c-chip', 'Enabled');
    getChipGroup('Clusters impacted').contains('.pf-c-chip', '1 or more');
  });
});
