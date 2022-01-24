/*
* Separated module to group all filter related stuff
* and modify the test data without affection other tests
*/

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
import data from '../../../cypress/fixtures/ClusterRules/data.json';
import { LowBattery } from '@redhat-cloud-services/frontend-components/Battery';
import { TOTAL_RISK, CATEGORIES } from '../../../cypress/utils/globals';
import { combineFields, slideHalf } from '../../../cypress/utils/combine';
import { applyFilters } from '../../../cypress/utils/ui';

const EXPANDABLES = '[class="pf-c-table__expandable-row pf-m-expanded"]';
const CHIP = 'div[class=pf-c-chip]';
const ROW = 'tbody[role=rowgroup]';

const RULES_ENABLED = filter(data, (it) => !it.disabled).length;

const TOTAL_RISK_VALUES = Object.keys(TOTAL_RISK);
const CATEGORY_TAGS = flatten(Object.values(CATEGORIES));

// TODO validate that modifying data here will not affect other tests
// add a uniq prefix to each row description to make them distinguishable
const dataDistinguishable = map(data, (it) => {
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
    values: TOTAL_RISK_VALUES,
    type: 'checkbox',
  },
  category: {
    selectorText: 'Category',
    values: Object.keys(CATEGORIES),
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

function buildFiltersCombinations() {
  const data = {};
  for (const [key, value] of Object.entries(filtersConf)) {
    if (value.type === 'checkbox') {
      data[key] = Array.from(slideHalf(value.values));
    } else {
      data[key] = value.values;
    }
  }
  return Array.from(combineFields(data));
}

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

  buildFiltersCombinations().forEach((filters) => {
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
    });
  });
});
