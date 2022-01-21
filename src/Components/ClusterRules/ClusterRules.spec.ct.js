import React from 'react';
import { mount } from '@cypress/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import filter from 'lodash/filter';
import map from 'lodash/map';
import uniq from 'lodash/uniq';
import sortBy from 'lodash/sortBy';
import reverse from 'lodash/reverse';
import flatMap from 'lodash/flatMap';
import flatten from 'lodash/flatten';
import intersection from 'lodash/intersection';

import getStore from '../../Store';
import ClusterRules from './ClusterRules';
import '@patternfly/patternfly/patternfly.scss';
import data from '../../../cypress/fixtures/ClusterRules/data.json';
import { LowBattery } from '@redhat-cloud-services/frontend-components/Battery';

const EXPANDABLES = '[class="pf-c-table__expandable-row pf-m-expanded"]';
const CHIP = 'div[class=pf-c-chip]';
const ROW = 'tbody[role=rowgroup]';
const FILTERS_DROPDOWN = 'ul[class=pf-c-dropdown__menu]';
const FILTER_TOGGLE = 'span[class=pf-c-select__toggle-arrow]';

const RULES_ENABLED = filter(data, (it) => !it.disabled).length;
// FIXME should we use a map here?
const TOTAL_RISK = { Low: 1, Moderate: 2, Important: 3, Critical: 4 };
const TOTAL_RISK_VALUES = Object.keys(TOTAL_RISK);
const CATEGORIES = {
  'Service Availability': ['service_availability'],
  Security: ['security'],
  'Fault Tolerance': ['fault_tolerance'],
  Performance: ['performance'],
};
const CATEGORY_TAGS = flatten(Object.values(CATEGORIES));

describe('test data', () => {
  it('has rules', () => {
    cy.wrap(data).its('length').should('be.gte', 1);
  });
  it('has more than 1 enabled rule', () => {
    cy.wrap(RULES_ENABLED).should('be.gt', 1);
  });
  it('has 0 disabled rules', () => {
    cy.wrap(filter(data, (it) => it.disabled).length).should('be.eq', 0);
  });
  it('all total risk values are present', () => {
    cy.wrap(uniq(map(data, 'total_risk')))
      .its('length')
      .should('be.eq', TOTAL_RISK_VALUES.length);
  });
  it('all categories are present', () => {
    cy.wrap(uniq(flatMap(data, 'tags')))
      .its('length')
      .should('be.eq', CATEGORY_TAGS.length);
  });
  it('at least 2 descriptions are different', () => {
    cy.wrap(uniq(map(data, 'description')))
      .its('length')
      .should('be.gte', 2);
  });
});

describe('cluster rules table', () => {
  beforeEach(() => {
    // tables utilizes federated module and throws error when RHEL Advisor manifestaion not found
    window['__scalprum__'] = {
      apps: {},
      appsMetaData: {
        advisor: {
          manifestLocation:
            'https://qa.console.redhat.com/beta/apps/advisor/fed-mods.json',
          module: 'advisor#./RootApp',
          name: 'advisor',
        },
      },
    };
    cy.intercept('*', (req) => {
      req.destroy();
    });

    mount(
      <IntlProvider locale="en">
        <Provider store={getStore()}>
          <MemoryRouter
            initialEntries={['/clusters/41c30565-b4c9-49f2-a4ce-3277ad22b258']}
            initialIndex={0}
          >
            <Route path="/clusters/:clusterId">
              <ClusterRules reports={data} />
            </Route>
          </MemoryRouter>
        </Provider>
      </IntlProvider>
    );
  });

  it('renders ClusterRules', () => {
    cy.get('div[id=cluster-recs-list-table]').should('have.length', 1);
  });

  it('only first item expanded', () => {
    cy.get('#expanded-content1').should('have.length', 1);
    cy.get(EXPANDABLES).should('have.length', 1);
  });

  it('expand all, collapse all', () => {
    const TOOLBAR = '[class="pf-c-toolbar__item"]';

    cy.get(TOOLBAR).find('button').click();
    cy.get(EXPANDABLES).should('have.length', RULES_ENABLED);
    cy.get(TOOLBAR).find('button').click();
    cy.get(EXPANDABLES).should('have.length', 0);
  });

  it('total risk is mapped', () => {
    cy.get('td[data-label="Total risk"]').each((el) => {
      cy.wrap(el).should((risk) => {
        expect(risk.get(0).innerText).to.be.oneOf(TOTAL_RISK_VALUES);
      });
    });
  });

  Object.entries({
    description: 'Description',
    created_at: 'Added',
    total_risk: 'Total risk',
  }).forEach(([category, label]) => {
    ['ascending', 'descending'].forEach((order) => {
      it(`sort ${order} by ${label}`, () => {
        const col = `td[data-label="${label}"]`;
        const header = `th[data-label="${label}"]`;
        cy.get(col).should('have.length', 6);
        if (category !== 'description') {
          // sort first by description to ensure consistent ordering
          cy.get(`th[data-label="Description"]`).find('button').click();
        }
        cy.get(`th[data-label="${label}"]`).find('button').click();
        // FIXME right way to do the second click?
        if (order === 'descending') {
          // click a second time to reverse sorting
          cy.get(header).find('button').click();
        }
        let sortedDescriptions = map(
          sortBy(data, [category, 'description']),
          'description'
        );
        if (order === 'descending') {
          // reverse order
          sortedDescriptions = reverse(sortedDescriptions);
        }
        cy.get(`td[data-label="Description"]`)
          .then(($els) => {
            return map(Cypress.$.makeArray($els), 'innerText');
          })
          .should('deep.equal', sortedDescriptions);
      });
    });
  });
});

// TODO test for no chips displayed

const filtersConf = {
  description: {
    selectorText: 'Description',
    values: ['Lorem IPSUM', '1Lorem', 'Not existing recommendation'],
    type: 'input',
  },
  risk: {
    selectorText: 'Total risk',
    values: TOTAL_RISK_VALUES,
    type: 'checkbox',
  },
  category: {
    selectorText: 'Category',
    values: Object.keys(CATEGORIES),
    type: 'checkbox',
  },
};

function applyFilters(filters) {
  for (const [key, value] of Object.entries(filters)) {
    cy.get('div.ins-c-primary-toolbar__filter')
      .find('button[class=pf-c-dropdown__toggle]')
      .click({ force: true });

    if (key === 'description') {
      cy.get(FILTERS_DROPDOWN).contains('Description').click({ force: true });
      cy.get('input.ins-c-conditional-filter').type(value);
    } else if (key === 'risk') {
      cy.get(FILTERS_DROPDOWN).contains('Total risk').click({ force: true });
      cy.get(FILTER_TOGGLE).click({ force: true });
      value.forEach((it) => {
        cy.get('ul[class=pf-c-select__menu]')
          .find('label')
          .contains(it)
          .parent()
          .find('input[type=checkbox]')
          .check({ force: true });
      });
    } else if (key === 'category') {
      cy.get(FILTERS_DROPDOWN).contains('Category').click({ force: true });
      cy.get(FILTER_TOGGLE).click({ force: true });
      value.forEach((it) => {
        cy.get('ul[class=pf-c-select__menu]')
          .find('label')
          .contains(it)
          .parent()
          .find('input[type=checkbox]')
          .check({ force: true });
      });
    }
  }
}

function* combinations(arr, current = []) {
  //return [{ description: 'Lorem' }, { risk: ['Low', 'Critical'], category: Object.keys(CATEGORIES) }];
  let i = 0;
  while (i < arr.length) {
    let next = current.concat(arr[i]);
    yield next;
    i++;
    if (next.length <= arr.length) {
      yield* combinations(arr.slice(i), next);
    }
  }
}

function* combineFields(data, fields = null) {
  if (fields == null) {
    fields = Object.keys(data);
  }
  if (fields.length > 0) {
    const field = fields.pop();
    for (let x of combineFields(data, fields)) {
      yield x;
      for (let y of data[field]) {
        const obj = { ...x };
        obj[field] = y;
        yield obj;
      }
    }
  } else {
    yield {};
  }
}

// add a uniq prefix to each row description to make them distinguishable
const dataDistinguishable = map(data, (it) => {
  it.description = `${Math.random().toString(36).substring(2, 15)} ${
    it.description
  }`;
  return it;
});

function filterData(data, filters) {
  let filteredData = data;
  for (const [key, value] of Object.entries(filters)) {
    if (key === 'description') {
      filteredData = filter(filteredData, (it) =>
        it.description.toLowerCase().includes(value.toLowerCase())
      );
    } else if (key === 'risk') {
      const riskNumbers = map(value, (it) => TOTAL_RISK[it]);
      filteredData = filter(filteredData, (it) =>
        riskNumbers.includes(it.total_risk)
      );
    } else if (key === 'category') {
      const tags = flatMap(value, (it) => CATEGORIES[it]);
      filteredData = filter(
        filteredData,
        (it) => intersection(tags, it.tags).length > 0
      );
    }
    // if length is already 0, exit
    if (filteredData.length === 0) {
      break;
    }
  }
  return filteredData;
}

function sortCombinations() {
  const data = {};
  for (const [key, value] of Object.entries(filtersConf)) {
    if (value.type === 'checkbox') {
      data[key] = Array.from(combinations(value.values));
    } else {
      data[key] = value.values;
    }
  }
  return Array.from(combineFields(data));
}

describe('cluster rules table filtering', () => {
  beforeEach(() => {
    // tables utilizes federated module and throws error when RHEL Advisor manifestaion not found
    window['__scalprum__'] = {
      apps: {},
      appsMetaData: {
        advisor: {
          manifestLocation:
            'https://qa.console.redhat.com/beta/apps/advisor/fed-mods.json',
          module: 'advisor#./RootApp',
          name: 'advisor',
        },
      },
    };
    cy.intercept('*', (req) => {
      req.destroy();
    });

    mount(
      <IntlProvider locale="en">
        <Provider store={getStore()}>
          <MemoryRouter
            initialEntries={['/clusters/41c30565-b4c9-49f2-a4ce-3277ad22b258']}
            initialIndex={0}
          >
            <Route path="/clusters/:clusterId">
              <ClusterRules reports={dataDistinguishable} />
            </Route>
          </MemoryRouter>
        </Provider>
      </IntlProvider>
    );
  });

  it('data has only 1 description matching "1Lorem"', () => {
    cy.wrap(filterData(dataDistinguishable, { description: '1Lorem' })).should(
      'have.length',
      1
    );
  });

  it('data has multiple descriptions matching "Lorem ipsum"', () => {
    cy.wrap(filterData(dataDistinguishable, { description: 'Lorem ipsum' }))
      .its('length')
      .should('be.gt', 1);
  });

  it('data has no descriptions matching "Not existing recommendation"', () => {
    cy.wrap(
      filterData(dataDistinguishable, {
        description: 'Not existing recommendation',
      })
    ).should('have.length', 0);
  });

  sortCombinations().forEach((filters) => {
    it('test sorting', () => {
      const sortedDescriptions = map(
        filterData(dataDistinguishable, filters),
        'description'
      ).sort();
      applyFilters(filters);
      if (sortedDescriptions.length === 0) {
        // TODO check empty table view
      } else {
        cy.get(`td[data-label="Description"]`)
          .then(($els) => {
            return map(Cypress.$.makeArray($els), 'innerText').sort();
          })
          .should('deep.equal', sortedDescriptions);
      }
    });
  });
});
