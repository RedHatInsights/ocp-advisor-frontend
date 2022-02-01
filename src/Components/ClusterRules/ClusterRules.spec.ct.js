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
import cloneDeep from 'lodash/cloneDeep';

import getStore from '../../Store';
import ClusterRules from './ClusterRules';
import '@patternfly/patternfly/patternfly.scss';
import data from '../../../cypress/fixtures/ClusterRules/data.json';
import { TOTAL_RISK, CATEGORIES } from '../../../cypress/utils/globals';
import { applyFilters } from '../../../cypress/utils/ui';
import { cumulativeCombinations } from '../../../cypress/utils/combine';

const EXPANDABLES = '[class="pf-c-table__expandable-row pf-m-expanded"]';
const CHIP_GROUP = '.pf-c-chip-group__main';
const TABLE_HEADERS = ['Description', 'Added', 'Total risk'];

const RULES_ENABLED = filter(data, (it) => !it.disabled).length;

const TOTAL_RISK_VALUES = Object.keys(TOTAL_RISK);
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
    cy.get('table th')
      .then(($els) => {
        return map(Cypress.$.makeArray($els), 'innerText');
      })
      .should('deep.equal', TABLE_HEADERS);
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

  it('no chips are displayed', () => {
    cy.get(CHIP_GROUP).should('not.exist');
    cy.get('button').contains('Reset filters').should('not.exist');
  });

  it('clear filters work', () => {
    // TODO implement test
  });

  it('chips can be cleared', () => {
    // TODO implement test
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

describe('empty cluster rules table', () => {
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
              <ClusterRules reports={[]} />
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
    // FIXME makes sense to text for both strings in the card or as both are bundled together with one is enough?
    cy.get('[data-ouia-component-id="no-recommendations"]')
      .contains('The cluster is not affected by any known recommendations')
      .should('exist');
  });

  it('does not render table', () => {
    cy.get('table').should('not.exist');
  });
});

// TODO what will happen if server fails to respond?

// TODO validate that modifying data here will not affect other tests
// add a uniq prefix to each row description to make them distinguishable
const dataDistinguishable = map(cloneDeep(data), (it) => {
  it.description = `${Math.random().toString(36).substring(2, 15)} ${
    it.description
  }`;
  return it;
});

const filtersConf = {
  description: {
    selectorText: 'Description',
    values: ['Lorem IPSUM', '1Lorem', 'Not existing recommendation'],
    type: 'input',
  },
  risk: {
    selectorText: 'Total risk',
    values: Array.from(cumulativeCombinations(TOTAL_RISK_VALUES)),
    type: 'checkbox',
  },
  category: {
    selectorText: 'Category',
    values: Array.from(cumulativeCombinations(Object.keys(CATEGORIES))),
    type: 'checkbox',
  },
};

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

// TODO add more combinations of filters for testing
const filterCombos = [
  { risk: ['Critical', 'Moderate'], category: ['Service Availability'] },
];

describe('test data', () => {
  it('has more than 1 enabled rule', () => {
    cy.wrap(RULES_ENABLED).should('be.gt', 1);
  });

  it('has only 1 description matching "1Lorem"', () => {
    cy.wrap(filterData(dataDistinguishable, { description: '1Lorem' })).should(
      'have.length',
      1
    );
  });

  it('has multiple descriptions matching "Lorem ipsum"', () => {
    cy.wrap(filterData(dataDistinguishable, { description: 'Lorem ipsum' }))
      .its('length')
      .should('be.gt', 1);
  });

  it('has no descriptions matching "Not existing recommendation"', () => {
    cy.wrap(
      filterData(dataDistinguishable, {
        description: 'Not existing recommendation',
      })
    ).should('have.length', 0);
  });
});

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

  Object.entries(filtersConf).forEach(([k, v]) => {
    v.values.forEach((filterValues) => {
      it(`test filtering ${k} ${filterValues}`, () => {
        const filters = {};
        filters[k] = filterValues;
        const sortedDescriptions = map(
          filterData(dataDistinguishable, filters),
          'description'
        ).sort();
        applyFilters(filters, filtersConf);
        if (sortedDescriptions.length === 0) {
          // TODO check empty table view
        } else {
          cy.get(`td[data-label="Description"]`)
            .then(($els) => {
              return map(Cypress.$.makeArray($els), 'innerText').sort();
            })
            .should('deep.equal', sortedDescriptions);
        }
        // TODO check chips
      });
    });
  });

  filterCombos.forEach((filters) => {
    it(`test sorting ${Object.keys(filters)}`, () => {
      const sortedDescriptions = map(
        filterData(dataDistinguishable, filters),
        'description'
      ).sort();
      // debugger;
      applyFilters(filters, filtersConf);
      if (sortedDescriptions.length === 0) {
        // TODO check empty table view
      } else {
        cy.get(`td[data-label="Description"]`)
          .then(($els) => {
            return map(Cypress.$.makeArray($els), 'innerText').sort();
          })
          .should('deep.equal', sortedDescriptions);
      }
      // TODO check chips
    });
  });
});
