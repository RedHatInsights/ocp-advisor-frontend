import React from 'react';
import { mount } from '@cypress/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import _ from 'lodash';

import getStore from '../../Store';
import ClusterRules from './ClusterRules';
import '@patternfly/patternfly/patternfly.scss';
import data from '../../../cypress/fixtures/ClusterRules/data.json';
import { TOTAL_RISK, CATEGORIES } from '../../../cypress/utils/globals';
import { applyFilters } from '../../../cypress/utils/filters';
import { cumulativeCombinations } from '../../../cypress/utils/combine';
import { CHIP_GROUP, CHIP, ROWS } from '../../../cypress/views/filterableTable';

const EXPANDABLES = '[class="pf-c-table__expandable-row pf-m-expanded"]';
const TABLE_HEADERS = ['Description', 'Added', 'Total risk'];

const RULES_ENABLED = _.filter(data, (it) => !it.disabled).length;

const TOTAL_RISK_VALUES = Object.keys(TOTAL_RISK);
const CATEGORY_TAGS = _.flatten(Object.values(CATEGORIES));

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
  it('has rules', () => {
    cy.wrap(data).its('length').should('be.gte', 1);
  });
  it('has more than 1 enabled rule', () => {
    cy.wrap(RULES_ENABLED).should('be.gt', 1);
  });
  it('has 0 disabled rules', () => {
    cy.wrap(_.filter(data, (it) => it.disabled).length).should('be.eq', 0);
  });
  it('all total risk values are present', () => {
    cy.wrap(_.uniq(_.map(data, 'total_risk')))
      .its('length')
      .should('be.eq', TOTAL_RISK_VALUES.length);
  });
  it('all categories are present', () => {
    cy.wrap(_.uniq(_.flatMap(data, 'tags')))
      .its('length')
      .should('be.eq', CATEGORY_TAGS.length);
  });
  it('at least 2 descriptions are different', () => {
    cy.wrap(_.uniq(_.map(data, 'description')))
      .its('length')
      .should('be.gte', 2);
  });
  it('has only 1 description matching "1Lorem"', () => {
    cy.wrap(filterData(data, { description: '1Lorem' })).should(
      'have.length',
      1
    );
  });
  it('has multiple descriptions matching "Lorem ipsum"', () => {
    cy.wrap(filterData(data, { description: 'Lorem ipsum' }))
      .its('length')
      .should('be.gt', 1);
  });
  it('has no descriptions matching "Not existing recommendation"', () => {
    cy.wrap(
      filterData(data, {
        description: 'Not existing recommendation',
      })
    ).should('have.length', 0);
  });
  it('the first combo filter has less rules hitting that the default at least one', () => {
    cy.wrap(filterData(data, filterCombos[0]))
      .its('length')
      .should('be.gte', 1)
      .and('be.lt', RULES_ENABLED);
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
        return _.map(Cypress.$.makeArray($els), 'innerText');
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

  it('no chips are displayed by default', () => {
    cy.get(CHIP_GROUP).should('not.exist');
    cy.get('button').contains('Reset filters').should('not.exist');
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
        let sortedDescriptions = _.map(
          _.sortBy(data, [category, 'description']),
          'description'
        );
        if (order === 'descending') {
          // reverse order
          sortedDescriptions = _.reverse(sortedDescriptions);
        }
        cy.get(`td[data-label="Description"]`)
          .then(($els) => {
            return _.map(Cypress.$.makeArray($els), 'innerText');
          })
          .should('deep.equal', sortedDescriptions);
      });
    });
  });

  it('clear filters work', () => {
    // apply some filters
    applyFilters(filterCombos[0], filtersConf);
    cy.get(CHIP_GROUP).should('exist');
    // clear filters
    cy.get('button').contains('Reset filters').click();
    cy.get(CHIP_GROUP).should('not.exist');
    cy.get('button').contains('Reset filters').should('not.exist');
    // expandable rows are duplicated, so we get one label
    cy.get('table')
      .find(ROWS)
      .find(`td[data-label="Description"]`)
      .should('have.length', RULES_ENABLED);
  });

  it('chips can be cleared', () => {
    applyFilters(filterCombos[0], filtersConf);
    cy.get(CHIP_GROUP).should('exist');
    cy.get('button').contains('Reset filters').click();
    cy.get(CHIP_GROUP).should('not.exist');
  });

  it('empty state is displayed when filters do not match any rule', () => {
    applyFilters(
      {
        description: 'Not existing recommendation',
      },
      filtersConf
    );
    // TODO check empty table view
    // TODO headers are displayed
  });

  Object.entries(filtersConf).forEach(([k, v]) => {
    v.values.forEach((filterValues) => {
      it(`test filtering ${k} ${filterValues}`, () => {
        const filters = {};
        filters[k] = filterValues;
        const sortedDescriptions = _.map(
          filterData(data, filters),
          'description'
        ).sort();
        applyFilters(filters, filtersConf);
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
        cy.get(CHIP_GROUP).should('have.length', Object.keys(filters).length);
        // check chips
        for (const [k, v] of Object.entries(filters)) {
          let groupName = filtersConf[k].selectorText;
          // TODO remove this change CCXDEV-7192
          groupName = groupName == 'Description' ? 'Name' : groupName;
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

  filterCombos.forEach((filters) => {
    it(`test sorting ${Object.keys(filters)}`, () => {
      const sortedDescriptions = _.map(
        filterData(data, filters),
        'description'
      ).sort();
      // debugger;
      applyFilters(filters, filtersConf);
      if (sortedDescriptions.length === 0) {
        // TODO check empty table view
      } else {
        cy.get(`td[data-label="Description"]`)
          .then(($els) => {
            return _.map(Cypress.$.makeArray($els), 'innerText').sort();
          })
          .should('deep.equal', sortedDescriptions);
      }
      // validate chips
      cy.get(CHIP_GROUP).should('have.length', Object.keys(filters).length);
      // check chips
      for (const [k, v] of Object.entries(filters)) {
        let groupName = filtersConf[k].selectorText;
        // TODO remove this change CCXDEV-7192
        groupName = groupName == 'Description' ? 'Name' : groupName;
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
