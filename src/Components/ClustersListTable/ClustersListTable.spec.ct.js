import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import _ from 'lodash';

import { Intl } from '../../Utilities/intlHelper';
import getStore from '../../Store';
import { ClustersListTable } from './ClustersListTable';
import props from '../../../cypress/fixtures/ClustersListTable/data.json';
import '@patternfly/patternfly/patternfly.scss';
import {
  TOOLBAR,
  ROW,
  PAGINATION,
  PAGINATION_MENU,
  CHIP_GROUP,
  DROPDOWN_TOGGLE,
  DROPDOWN_ITEM,
} from '../../../cypress/utils/components';
import {
  DEFAULT_ROW_COUNT,
  PAGINATION_VALUES,
} from '../../../cypress/utils/defaults';

const data = props['data'];
// add property name to clusters
let namedClusters = _.cloneDeep(data);
namedClusters.forEach(
  (it) =>
    (it['name'] = it['cluster_name'] ? it['cluster_name'] : it['cluster_id'])
);
// fill possible missing values
namedClusters.forEach((it) => {
  ['1', '2', '3', '4'].forEach((k) => {
    it['hits_by_total_risk'][k] = it['hits_by_total_risk'][k]
      ? it['hits_by_total_risk'][k]
      : 0;
  });
});

const TABLE = 'div[id=clusters-list-table]';
const TABLE_HEADERS = [
  'Name',
  'Recommendations',
  'Critical',
  'Important',
  'Moderate',
  'Low',
  'Last seen',
];

function checkRowCounts(n) {
  return cy
    .get('table tbody[role=rowgroup]')
    .find(ROW)
    .should('have.length', n);
}

function checkPaginationTotal(n) {
  return cy
    .get('.pf-c-options-menu__toggle-text')
    .find('b')
    .eq(1)
    .should('have.text', n);
}

// FIXME improve syntax
// FIXME move to utils module
function itemsPerPage() {
  let items = data.length;
  const array = [];
  while (items > 0) {
    const remain = items - DEFAULT_ROW_COUNT;
    let v = remain > 0 ? DEFAULT_ROW_COUNT : items;
    array.push(v);
    items = remain;
  }
  return array;
}

describe('data', () => {
  it('has values', () => {
    cy.wrap(data).its('length').should('be.gte', 1);
  });
  it('has more entried than default pagination', () => {
    cy.wrap(data).its('length').should('be.gt', DEFAULT_ROW_COUNT);
  });
  it('at least one cluster has cluster name', () => {
    cy.wrap(_.filter(data, (it) => it.cluster_name))
      .its('length')
      .should('be.gte', 1);
  });
  it('first cluster has name', () => {
    cy.wrap(data[0]['cluster_name']).should('not.be.empty');
  });
  it('first page items contains at least one cluster without name', () => {
    const itemsInFirstPage = Math.min(DEFAULT_ROW_COUNT, data.length);
    cy.wrap(_.filter(data.slice(0, itemsInFirstPage), (it) => it.cluster_name))
      .its('length')
      .should('be.lt', itemsInFirstPage);
  });
  it('at least one entry has last seen', () => {
    cy.wrap(_.filter(data, (it) => it.last_checked_at))
      .its('length')
      .should('be.gte', 1);
  });
  it('at least one entry does not have last seen', () => {
    cy.wrap(_.filter(data, (it) => it.last_checked_at === ''))
      .its('length')
      .should('be.gte', 1);
  });
  it('at least one entry does not have all values for total risk categories', () => {
    cy.wrap(
      _.filter(data, (it) => Object.keys(it['hits_by_total_risk']).length)
    )
      .its('length')
      .should('be.gte', 1);
  });
});

describe('clusters list table', () => {
  const TBODY = 'tbody[role=rowgroup]';
  const TOOLBAR_FILTER = '.ins-c-primary-toolbar__filter';

  Cypress.Commands.add('getTotalClusters', () =>
    cy.get('.pf-c-options-menu__toggle-text').find('b').eq(1)
  );
  Cypress.Commands.add('getFirstRow', () => cy.get(TBODY).children().eq(0));
  Cypress.Commands.add('getLastRow', () => cy.get(TBODY).children().eq(28));

  beforeEach(() => {
    mount(
      <MemoryRouter initialEntries={['/clusters']} initialIndex={0}>
        <Intl>
          <Provider store={getStore()}>
            <ClustersListTable
              query={{
                isError: false,
                isFetching: false,
                isUninitialized: false,
                isSuccess: true,
                data: props,
              }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('renders table', () => {
    cy.get(TABLE).within(() => {
      cy.get(TOOLBAR).should('have.length', 1);
      cy.get('table').should('have.length', 1);
    });
  });

  it('shows first clusters only', () => {
    checkRowCounts(DEFAULT_ROW_COUNT);
  });

  it('shows correct total number of clusters', () => {
    checkPaginationTotal(data.length);
  });

  it('shows table headers', () => {
    cy.get('table th')
      .then(($els) => {
        return _.map(Cypress.$.makeArray($els), 'innerText');
      })
      .should('deep.equal', TABLE_HEADERS);
  });

  it(`pagination default is set to ${DEFAULT_ROW_COUNT}`, () => {
    cy.get('.pf-c-options-menu__toggle-text')
      .find('b')
      .eq(0)
      .should('have.text', '1 - 20');
  });

  it('can change page limit', () => {
    // FIXME: best way to make the loop
    cy.wrap(PAGINATION_VALUES).each((el) => {
      cy.get(TOOLBAR).find(PAGINATION_MENU).find(DROPDOWN_TOGGLE).click();
      cy.get(TOOLBAR)
        .find(PAGINATION_MENU)
        .find('ul[class=pf-c-options-menu__menu]')
        .find(DROPDOWN_ITEM)
        .contains(`${el}`)
        .click({ force: true }); // caused by the css issue
      checkRowCounts(Math.min(el, data.length));
    });
  });

  it('pagination defaults are expected ones', () => {
    cy.get(TOOLBAR).find(PAGINATION_MENU).find(DROPDOWN_TOGGLE).click();
    cy.get(TOOLBAR)
      .find(PAGINATION_MENU)
      .find('ul[class=pf-c-options-menu__menu]')
      .find('li')
      .each(($el, index) => {
        cy.wrap($el).should(
          'have.text',
          `${PAGINATION_VALUES[index]} per page`
        );
      });
  });

  it('can iterate over pages', () => {
    cy.wrap(itemsPerPage()).each((el, index, list) => {
      checkRowCounts(el);
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

  it('applies one total risk filter as a default', () => {
    cy.get(CHIP_GROUP)
      .find('.pf-c-chip-group__label')
      .should('have.text', 'Total risk');
    cy.get(CHIP_GROUP)
      .find('.pf-c-chip__text')
      .should('have.length', 1)
      .should('have.text', 'All clusters');
  });

  it('reset filters button is displayed', () => {
    cy.get('button').contains('Reset filters').should('exist');
  });

  // TODO improve filtering tests
  // TODO check that empty table is displayed with appropriate filters

  it('can filter out only hitting clusters', () => {
    // initially there are 29 clusters
    cy.getTotalClusters().should('have.text', 29);
    // open filter toolbar
    cy.get('.ins-c-primary-toolbar__filter button').click();
    //change the filter toolbar item
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-dropdown__menu')
      .find('li')
      .eq(1)
      .click({ force: true });
    cy.get(TOOLBAR_FILTER).find('.pf-c-select__toggle').click();
    // remove "All clusters" filter value
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-select__menu')
      .find('input')
      .eq(0)
      .click({ force: true });
    // open pagination
    cy.get(PAGINATION)
      .eq(0)
      .find('.pf-c-options-menu__toggle-button')
      .click({ force: true });
    // set to 50 clusters per page
    cy.get(PAGINATION)
      .eq(0)
      .find('.pf-c-options-menu')
      .find('li')
      .eq(2)
      .find('button')
      .click({ force: true });
    cy.getTotalClusters().should('have.text', 26);
    // check all shown clusters have recommendations > 0
    cy.get('TBODY')
      .find('td[data-label=Recommendations]')
      .each((r) => {
        cy.wrap(r).should('not.have.value', 0);
      });
  });

  it('can filter clusters by the total risk critical', () => {
    cy.get('.ins-c-primary-toolbar__filter button').click();
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-dropdown__menu')
      .find('li')
      .eq(1)
      .click({ force: true });
    cy.get(TOOLBAR_FILTER).find('.pf-c-select__toggle').click();
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-select__menu')
      .find('input')
      .eq(0)
      .click({ force: true });
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-select__menu')
      .find('input')
      .eq(1)
      .click({ force: true });
    cy.get('.pf-c-table__sort').eq(2).click();
    cy.getFirstRow().find('td[data-label=Critical]').should('have.text', 1);
    cy.get('.pf-c-table__sort').eq(2).click();
    cy.getFirstRow().find('td[data-label=Critical]').should('have.text', 4);
  });

  it('can filter clusters by the total risk Important', () => {
    cy.get('.ins-c-primary-toolbar__filter button').click();
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-dropdown__menu')
      .find('li')
      .eq(1)
      .click({ force: true });
    cy.get(TOOLBAR_FILTER).find('.pf-c-select__toggle').click();
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-select__menu')
      .find('input')
      .eq(0)
      .click({ force: true });
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-select__menu')
      .find('input')
      .eq(2)
      .click({ force: true });
    cy.get('.pf-c-table__sort').eq(3).click();
    cy.getFirstRow().find('td[data-label=Important]').should('have.text', 1);
    cy.get('.pf-c-table__sort').eq(3).click();
    cy.getFirstRow().find('td[data-label=Important]').should('have.text', 9);
  });

  it('can filter clusters by the total risk Moderate', () => {
    cy.get('.ins-c-primary-toolbar__filter button').click();
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-dropdown__menu')
      .find('li')
      .eq(1)
      .click({ force: true });
    cy.get(TOOLBAR_FILTER).find('.pf-c-select__toggle').click();
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-select__menu')
      .find('input')
      .eq(0)
      .click({ force: true });
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-select__menu')
      .find('input')
      .eq(3)
      .click({ force: true });
    cy.get('.pf-c-table__sort').eq(4).click();
    cy.getFirstRow().find('td[data-label=Moderate]').should('have.text', 3);
    cy.get('.pf-c-table__sort').eq(4).click();
    cy.getFirstRow().find('td[data-label=Moderate]').should('have.text', 19);
  });

  it('can filter clusters by the total risk Low', () => {
    cy.get('.ins-c-primary-toolbar__filter button').click();
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-dropdown__menu')
      .find('li')
      .eq(1)
      .click({ force: true });
    cy.get(TOOLBAR_FILTER).find('.pf-c-select__toggle').click();
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-select__menu')
      .find('input')
      .eq(0)
      .click({ force: true });
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-select__menu')
      .find('input')
      .eq(4)
      .click({ force: true });
    cy.get('.pf-c-table__sort').eq(5).click();
    cy.getFirstRow().find('td[data-label=Low]').should('have.text', 1);
    cy.get('.pf-c-table__sort').eq(5).click();
    cy.getFirstRow().find('td[data-label=Low]').should('have.text', 14);
  });

  it('can filter by name', () => {
    // search by "cc" search input
    cy.get(TOOLBAR_FILTER).find('.pf-c-form-control').type('cc');
    // should be 4 clusters left
    cy.get(TBODY)
      .children()
      .should('have.length', 4)
      .each((r) => {
        cy.wrap(r).contains('cc');
      });
  });

  it('can sort by columns', () => {
    // check initial state
    cy.getFirstRow()
      .find('td[data-label=Name]')
      .should('have.text', 'gvgubed6h jzcmr99ojh');
    // click on the Name sorting button
    cy.get('.pf-c-table__sort').eq(0).click();
    cy.getFirstRow()
      .find('td[data-label=Name]')
      .should('have.text', '1ghhxwjfoi 5b5hbyv07');
    // click on the Recommendations sorting button
    cy.get('.pf-c-table__sort').eq(1).click();
    // the first cluster has 0 recommendations
    cy.getFirstRow()
      .find('td[data-label=Recommendations]')
      .should('have.text', 0);
  });

  it('rows show cluster names instead uuids when available', () => {
    const names = _.map(namedClusters, 'name');
    cy.get(`td[data-label="Name"]`)
      .then(($els) => {
        return _.map(Cypress.$.makeArray($els), 'innerText');
      })
      .should(
        'deep.equal',
        names.slice(0, Math.min(DEFAULT_ROW_COUNT, names.length))
      );
  });

  it('names of rows are links', () => {
    cy.getFirstRow()
      .find('td[data-label=Name]')
      .find(`a[href="/clusters/${data[0]['cluster_id']}"]`)
      .should('have.text', data[0]['cluster_name']);
  });

  it('sorts N/A in last seen correctly', () => {
    cy.get('.pf-c-table__sort').eq(6).click();
    cy.getFirstRow().find('span').should('have.text', 'N/A');
    cy.get('.pf-c-table__sort').eq(6).click();
    cy.get(PAGINATION)
      .eq(0)
      .find('.pf-c-options-menu__toggle-button')
      .click({ force: true });
    cy.get(PAGINATION)
      .eq(0)
      .find('.pf-c-options-menu')
      .find('li')
      .eq(2)
      .find('button')
      .click({ force: true });
    cy.getLastRow().find('span').should('have.text', 'N/A');
  });

  it('shows correct amount of each type of the rule hits', () => {
    cy.getFirstRow().find('td[data-label=Critical]').should('have.text', 4);
    cy.getFirstRow().find('td[data-label=Important]').should('have.text', 9);
    cy.getFirstRow().find('td[data-label=Moderate]').should('have.text', 16);
    cy.getFirstRow().find('td[data-label=Low]').should('have.text', 8);
  });

  // TODO fix test: double sorting? keep ordering in single sorting?
  Object.entries({
    name: 'Name',
    total_hit_count: 'Recommendations',
    'hits_by_total_risk.4': 'Critical',
    'hits_by_total_risk.3': 'Important',
    'hits_by_total_risk.2': 'Moderate',
    'hits_by_total_risk.1': 'Low',
    last_checked_at: 'Last seen',
  }).forEach(([category, label]) => {
    ['ascending', 'descending'].forEach((order) => {
      it(`sort ${order} by ${label}`, () => {
        const col = `td[data-label="${label}"]`;
        const header = `th[data-label="${label}"]`;

        cy.get(col).should(
          'have.length',
          Math.min(DEFAULT_ROW_COUNT, namedClusters.length)
        );
        cy.get(header).find('button').click();
        // FIXME right way to do the second click?
        if (order === 'descending') {
          // click a second time to reverse sorting
          cy.get(header).find('button').click();
        }

        // add property name to clusters
        let sortedNames = _.map(
          // preserver original ordering
          _.orderBy(
            _.cloneDeep(namedClusters),
            [category],
            [order === 'descending' ? 'desc' : 'asc']
          ),
          'name'
        );
        cy.get(`td[data-label="Name"]`)
          .then(($els) => {
            return _.map(Cypress.$.makeArray($els), 'innerText');
          })
          .should(
            'deep.equal',
            sortedNames.slice(
              0,
              Math.min(DEFAULT_ROW_COUNT, sortedNames.length)
            )
          );
      });
    });
  });
});

describe('cluster list Empty state rendering', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter initialEntries={['/clusters']} initialIndex={0}>
        <Intl>
          <Provider store={getStore()}>
            <ClustersListTable
              query={{
                isError: false,
                isFetching: false,
                isUninitialized: false,
                isSuccess: true,
                data: [],
              }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('renders the Empty State component', () => {
    cy.get('div[class=pf-c-empty-state__content]')
      .should('have.length', 1)
      .find('h2')
      .should('have.text', 'No clusters yet');
    cy.get('div[class=pf-c-empty-state__body]').should(
      'have.text',
      'To get started, create or register your cluster to get recommendations from Insights Advisor.'
    );
    cy.get('div[class=pf-c-empty-state__content]')
      .children()
      .eq(3)
      .should('have.text', 'Create cluster');
    cy.get('div[class=pf-c-empty-state__secondary]')
      .children()
      .eq(0)
      .should('have.text', 'Register cluster');
    cy.get('div[class=pf-c-empty-state__secondary]')
      .children()
      .eq(1)
      .should('have.text', 'Assisted Installer clusters');
  });
});
