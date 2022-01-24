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
import { TOTAL_RISK, CATEGORIES } from '../../../cypress/utils/globals';
import { combineFields, slideHalf } from '../../../cypress/utils/combine';
import { applyFilters } from '../../../cypress/utils/ui';

const EXPANDABLES = '[class="pf-c-table__expandable-row pf-m-expanded"]';
const CHIP = 'div[class=pf-c-chip]';
const ROW = 'tbody[role=rowgroup]';
const CHIP_GROUP = '.pf-c-chip-group__main';

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