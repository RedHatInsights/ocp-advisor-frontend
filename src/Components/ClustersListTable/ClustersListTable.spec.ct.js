import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import _ from 'lodash';

import { Intl } from '../../Utilities/intlHelper';
import getStore from '../../Store';
import { ClustersListTable } from './ClustersListTable';
import props from '../../../cypress/fixtures/api/insights-results-aggregator/v2/clusters.json';
import {
  TOOLBAR,
  PAGINATION,
  CHIP_GROUP,
  TBODY,
  TOOLBAR_FILTER,
} from '../../../cypress/utils/components';
import {
  DEFAULT_ROW_COUNT,
  PAGINATION_VALUES,
} from '../../../cypress/utils/defaults';
import { SORTING_ORDERS } from '../../../cypress/utils/globals';
import {
  checkTableHeaders,
  checkRowCounts,
} from '../../../cypress/utils/table';
import {
  itemsPerPage,
  checkPaginationTotal,
  checkPaginationValues,
  changePagination,
} from '../../../cypress/utils/pagination';

// TODO check if we can rid this of this data and use namedClustersInstead
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
// default sorting
let namedClustersDefaultSorting = _.orderBy(
  namedClusters,
  [(it) => it.last_checked_at || '1970-01-01T01:00:00.001Z'],
  ['desc']
);

const ROOT = 'div[id=clusters-list-table]';
const TABLE_HEADERS = [
  'Name',
  'Recommendations',
  'Critical',
  'Important',
  'Moderate',
  'Low',
  'Last seen',
];

// TODO move sw else? Also useful for other modules
function columnName2UrlParam(name) {
  return name.toLowerCase().replace(/ /g, '_');
}

const DEFAULT_DISPLAYED_SIZE = Math.min(
  namedClusters.length,
  DEFAULT_ROW_COUNT
);

// TODO: test pre-filled search parameters filtration

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
    const itemsInFirstPage = DEFAULT_DISPLAYED_SIZE;
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
    cy.wrap(_.filter(data, (it) => it.last_checked_at === undefined))
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
  // TODO remove those commands and convert to functions or utilities
  Cypress.Commands.add('getFirstRow', () => cy.get(TBODY).children().eq(0));

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

  it('renders table header', () => {
    checkTableHeaders(TABLE_HEADERS);
  });

  it('shows correct total number of clusters', () => {
    checkPaginationTotal(data.length);
  });

  describe('defaults', () => {
    it(`shows ${DEFAULT_DISPLAYED_SIZE} clusters only`, () => {
      checkRowCounts(ROOT, DEFAULT_DISPLAYED_SIZE);
      expect(window.location.search).to.contain(`limit=${DEFAULT_ROW_COUNT}`);
    });

    it(`pagination is set to ${DEFAULT_ROW_COUNT}`, () => {
      cy.get('.pf-c-options-menu__toggle-text')
        .find('b')
        .eq(0)
        .should('have.text', `1 - ${DEFAULT_DISPLAYED_SIZE}`);
    });

    it.only('sorting using last seen', () => {
      // TODO create a function used also in other tests
      cy.get(ROOT)
        .find('th[data-label="Last seen"]')
        .should('have.class', 'pf-c-table__sort pf-m-selected');
    });

    it('applies total risk "All clusters" filter', () => {
      cy.get(CHIP_GROUP)
        .find('.pf-c-chip-group__label')
        .should('have.text', 'Total risk');
      cy.get(CHIP_GROUP)
        .find('.pf-c-chip__text')
        .should('have.length', 1)
        .should('have.text', 'All clusters');
      expect(window.location.search).to.contain(`hits=all`);
    });

    it('reset filters button is displayed', () => {
      cy.get('button').contains('Reset filters').should('exist');
    });
  });

  describe('pagination', () => {
    it('shows correct total number of clusters', () => {
      checkPaginationTotal(data.length);
    });

    it('values are expected ones', () => {
      checkPaginationValues(PAGINATION_VALUES);
    });

    it('can change page limit', () => {
      // FIXME: best way to make the loop
      cy.wrap(PAGINATION_VALUES).each((el) => {
        changePagination(el).then(() =>
          // TODO should this be nested. Also the other check below?
          expect(window.location.search).to.contain(`limit=${el}`)
        );
        checkRowCounts(ROOT, Math.min(el, data.length));
      });
    });
    it('can iterate over pages', () => {
      cy.wrap(itemsPerPage(data.length)).each((el, index, list) => {
        checkRowCounts(ROOT, el).then(() => {
          // TODO why is this nested?
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
      });
    });
  });

  describe('sorting', () => {
    _.zip(
      [
        'name',
        'total_hit_count',
        'hits_by_total_risk.4',
        'hits_by_total_risk.3',
        'hits_by_total_risk.2',
        'hits_by_total_risk.1',
        'last_checked_at',
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
                  `sort=${columnName2UrlParam(label)}`
                )
              );
          } else {
            cy.get(header)
              .find('button')
              .dblclick()
              .then(() =>
                expect(window.location.search).to.contain(
                  `sort=-${columnName2UrlParam(label)}`
                )
              );
          }

          // map missing last_check_at to old times
          if (category === 'last_checked_at') {
            category = (it) => it.last_checked_at || '1970-01-01T01:00:00.001Z';
          }

          // add property name to clusters
          let sortedNames = _.map(
            // all tables must preserve original ordering
            _.orderBy(
              _.cloneDeep(namedClusters),
              [category],
              [order === 'ascending' ? 'asc' : 'desc']
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

  describe('filtering', () => {
    // TODO improve filtering tests
    // TODO check that empty table is displayed with appropriate filters

    it('can filter out only hitting clusters', () => {
      // initially there are 29 clusters
      checkPaginationTotal(29); // TODO do not hardcode value
      // open filter toolbar
      cy.get('.ins-c-primary-toolbar__filter button').click();
      //change the filter toolbar item
      cy.get(TOOLBAR_FILTER)
        .find('.pf-c-dropdown__menu')
        .find('li')
        .eq(1)
        .click();
      cy.get(TOOLBAR_FILTER).find('.pf-c-select__toggle').click();
      // remove "All clusters" filter value
      cy.get(TOOLBAR_FILTER)
        .find('.pf-c-select__menu')
        .find('input')
        .eq(0)
        .click()
        .then(() => expect(window.location.search).to.not.contain(`hits=`));
      // open pagination
      cy.get(PAGINATION)
        .eq(0)
        .find('.pf-c-options-menu__toggle-button')
        .click();
      // set to 50 clusters per page
      cy.get(PAGINATION)
        .eq(0)
        .find('.pf-c-options-menu')
        .find('li')
        .eq(2)
        .find('button')
        .click()
        .then(() => expect(window.location.search).to.contain(`limit=50`));
      checkPaginationTotal(24); // TODO do not hardcode value
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
        .click();
      cy.get(TOOLBAR_FILTER).find('.pf-c-select__toggle').click();
      // unflag "All clusters"
      cy.get(TOOLBAR_FILTER)
        .find('.pf-c-select__menu')
        .find('input')
        .eq(0)
        .click()
        .then(() => expect(window.location.search).to.not.contain(`hits=`));
      // flag "Critical"
      cy.get(TOOLBAR_FILTER)
        .find('.pf-c-select__menu')
        .find('input')
        .eq(1)
        .click()
        .then(() => expect(window.location.search).to.contain(`hits=4`));
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
        .click();
      cy.get(TOOLBAR_FILTER).find('.pf-c-select__toggle').click();
      cy.get(TOOLBAR_FILTER)
        .find('.pf-c-select__menu')
        .find('input')
        .eq(0)
        .click()
        .then(() => expect(window.location.search).to.not.contain(`hits=`));
      cy.get(TOOLBAR_FILTER)
        .find('.pf-c-select__menu')
        .find('input')
        .eq(2)
        .click()
        .then(() => expect(window.location.search).to.contain(`hits=3`));
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
        .click();
      cy.get(TOOLBAR_FILTER).find('.pf-c-select__toggle').click();
      cy.get(TOOLBAR_FILTER)
        .find('.pf-c-select__menu')
        .find('input')
        .eq(0)
        .click()
        .then(() => expect(window.location.search).to.not.contain(`hits=`));
      cy.get(TOOLBAR_FILTER)
        .find('.pf-c-select__menu')
        .find('input')
        .eq(3)
        .click()
        .then(() => expect(window.location.search).to.contain(`hits=2`));
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
        .click();
      cy.get(TOOLBAR_FILTER).find('.pf-c-select__toggle').click();
      cy.get(TOOLBAR_FILTER)
        .find('.pf-c-select__menu')
        .find('input')
        .eq(0)
        .click()
        .then(() => expect(window.location.search).to.not.contain(`hits=`));
      cy.get(TOOLBAR_FILTER)
        .find('.pf-c-select__menu')
        .find('input')
        .eq(4)
        .click()
        .then(() => expect(window.location.search).to.contain(`hits=1`));
      cy.get('.pf-c-table__sort').eq(5).click();
      cy.getFirstRow().find('td[data-label=Low]').should('have.text', 1);
      cy.get('.pf-c-table__sort').eq(5).click();
      cy.getFirstRow().find('td[data-label=Low]').should('have.text', 14);
    });

    it('can filter by name', () => {
      // search by "cc" search input
      cy.get(TOOLBAR_FILTER)
        .find('.pf-c-form-control')
        .type('cc')
        .then(() => expect(window.location.search).to.contain(`text=cc`));
      // should be 4 clusters left
      cy.get(TBODY)
        .children()
        .should('have.length', 4)
        .each((r) => {
          cy.wrap(r).contains('cc');
        });
    });
  });

  it('rows show cluster names instead uuids when available', () => {
    const names = _.map(namedClustersDefaultSorting, 'name');
    cy.get(`td[data-label="Name"]`)
      .then(($els) => {
        return _.map(Cypress.$.makeArray($els), 'innerText');
      })
      .should('deep.equal', names.slice(0, DEFAULT_DISPLAYED_SIZE));
  });

  it('names of rows are links', () => {
    cy.get(TBODY)
      .children()
      .each(($el, index) => {
        cy.wrap($el)
          .find('td[data-label=Name]')
          .find(
            `a[href="/clusters/${namedClustersDefaultSorting[index]['cluster_id']}"]`
          )
          .should('have.text', namedClustersDefaultSorting[index]['name']);
      });
  });

  // TODO avoid hardcoded values
  it('shows correct amount of each type of the rule hits', () => {
    cy.getFirstRow().find('td[data-label=Critical]').should('have.text', 2);
    cy.getFirstRow().find('td[data-label=Important]').should('have.text', 7);
    cy.getFirstRow().find('td[data-label=Moderate]').should('have.text', 9);
    cy.getFirstRow().find('td[data-label=Low]').should('have.text', 5);
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
