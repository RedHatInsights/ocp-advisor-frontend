import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import _ from 'lodash';

import { AffectedClustersTable } from './AffectedClustersTable';
import clusterDetailData from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule/external.rules.rule|ERROR_KEY/clusters_detail.json';
import { Intl } from '../../Utilities/intlHelper';
import getStore from '../../Store';
import '@patternfly/patternfly/patternfly.scss';
import {
  TOOLBAR,
  ROW,
  PAGINATION,
  CHIP_GROUP,
  DROPDOWN,
  MODAL,
  CHECKBOX,
  TBODY,
} from '../../../cypress/utils/components';
import {
  DEFAULT_ROW_COUNT,
  PAGINATION_VALUES,
} from '../../../cypress/utils/defaults';
import { SORTING_ORDERS } from '../../../cypress/utils/globals';
import {
  checkTableHeaders,
  checkPaginationTotal,
  checkRowCounts,
  checkPaginationValues,
  changePagination,
} from '../../../cypress/utils/table';
import rule from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule/external.rules.rule|ERROR_KEY.json';

// selectors
const ROOT = 'div[id=affected-list-table]';
const BULK_SELECT = 'clusters-selector';
const SEARCH_ITEMS = ['ff', 'CUSTOM', 'Foobar', 'Not existing cluster'];
const TABLE_HEADERS = ['Name', 'Last seen'];

const data = clusterDetailData.data;

function filterData(text = '') {
  return _.filter(data['enabled'], (it) =>
    (it?.cluster_name || it.cluster).toLowerCase().includes(text.toLowerCase())
  );
}

// FIXME improve syntax
// FIXME move to utils module
function itemsPerPage() {
  let items = filterData().length;
  const array = [];
  while (items > 0) {
    const remain = items - DEFAULT_ROW_COUNT;
    let v = remain > 0 ? DEFAULT_ROW_COUNT : items;
    array.push(v);
    items = remain;
  }
  return array;
}

describe('test data', () => {
  it('has enabled clusters', () => {
    cy.wrap(data['enabled']).its('length').should('be.gte', 1);
  });
  it('has more enabled clusters than default rows', () => {
    cy.wrap(data['enabled']).its('length').should('be.gt', DEFAULT_ROW_COUNT);
  });
  it('has less data than 51', () => {
    // 50 is the value [2] in pagination
    cy.wrap(data['enabled']).its('length').should('be.lte', 50);
  });
  it('has more than one enabled clusters with "custom" in name', () => {
    cy.wrap(filterData('custom')).its('length').should('be.gt', 1);
  });
  it('"foobar" is in the list of names to search and thre is at least one enabled cluster matching', () => {
    cy.wrap(filterData('foobar')).its('length').should('be.eq', 1);
    cy.wrap(_.map(SEARCH_ITEMS, (it) => it.toLowerCase())).should((arr) => {
      expect(arr).to.include('foobar');
    });
  });
  it('"Not existing cluster" is in the list of names to search and there are no enabled clusters matching it', () => {
    cy.wrap(filterData('Not existing cluster'))
      .its('length')
      .should('be.eq', 0);
    cy.wrap(_.map(SEARCH_ITEMS, (it) => it.toLowerCase())).should((arr) => {
      expect(arr).to.include('not existing cluster');
    });
  });
  it('has at least one entry with N/A time', () => {
    cy.wrap(_.filter(data['enabled'], (it) => it['last_checked_at'] === ''))
      .its('length')
      .should('be.gte', 1);
  });
  // TODO check also `rule` data
});

describe('non-empty successful affected clusters table', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <AffectedClustersTable
              query={{
                isError: false,
                isFetching: false,
                isUninitialized: false,
                isSuccess: true,
                data: data,
              }}
              rule={rule.content}
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
      cy.ouiaType('RHI/TableToolbar').should('have.length', 1);
    });
  });

  it('renders table header', () => {
    checkTableHeaders(TABLE_HEADERS);
  });

  // TODO do not hardcode values
  it('display name is rendered instead of cluster uuid', () => {
    cy.get(ROOT)
      .find(TBODY)
      .find(ROW)
      .contains('custom cluster name 2')
      .should('have.attr', 'href')
      .and('contain', '/clusters/f7331e9a-2f59-484d-af52-338d56165df5');
  });

  describe('defaults', () => {
    it(`shows ${DEFAULT_ROW_COUNT} clusters only`, () => {
      checkRowCounts(ROOT, DEFAULT_ROW_COUNT);
      // TODO check why expect fails
      // expect(window.location.search).to.contain('limit=20');
    });

    it(`pagination is set to ${DEFAULT_ROW_COUNT}`, () => {
      cy.get('.pf-c-options-menu__toggle-text')
        .find('b')
        .eq(0)
        .should('have.text', '1 - 20');
    });

    it('bulk selection is disabled', () => {
      cy.get(TOOLBAR)
        .find('.pf-m-spacer-sm')
        .find(DROPDOWN)
        .within((el) => {
          cy.wrap(el).click();
          cy.get('button')
            .contains('Disable recommendation for selected clusters')
            .should('have.class', 'pf-m-disabled');
        });
      cy.ouiaId(BULK_SELECT).find('input').should('not.be.checked');
    });

    it('sorting using last seen', () => {
      cy.get(ROOT)
        .find('th[data-key=2]') // TODO use column name
        .should('have.class', 'pf-c-table__sort pf-m-selected');
    });
  });

  describe('bulk selector', () => {
    it('checkbox can be clicked', () => {
      cy.ouiaId(BULK_SELECT).find('input').click().should('be.checked');
      // contains right text
      cy.ouiaId(BULK_SELECT)
        .find('label.pf-c-dropdown__toggle-check')
        .contains(`${data['enabled'].length} selected`);
      // checks all rows
      cy.get(ROOT)
        .find(TBODY)
        .find(ROW)
        .each((row) => {
          cy.wrap(row).find('td').first().find('input').should('be.checked');
        });
      // bulk disabling button is enabled
      cy.get(TOOLBAR)
        .find('.pf-m-spacer-sm')
        .find(DROPDOWN)
        .within((el) => {
          cy.wrap(el).click();
          cy.get('button')
            .contains('Disable recommendation for selected clusters')
            .should('not.have.class', 'pf-m-disabled');
        });
    });

    it('checkbox is unselected when a row is unselected', () => {
      cy.ouiaId(BULK_SELECT).find('input').click().should('be.checked');
      // removing one row unselects it
      cy.get(ROOT)
        .find(TBODY)
        .find(ROW)
        .first()
        .find('td')
        .first()
        .find('input')
        .click();
      cy.ouiaId(BULK_SELECT).find('input').should('not.be.checked');
      cy.ouiaId(BULK_SELECT)
        .find('label.pf-c-dropdown__toggle-check')
        .contains(`${data['enabled'].length - 1} selected`);
      // bulk disabling button is still enabled
      cy.get(TOOLBAR)
        .find('.pf-m-spacer-sm')
        .find(DROPDOWN)
        .within((el) => {
          cy.wrap(el).click();
          cy.get('button')
            .contains('Disable recommendation for selected clusters')
            .should('not.have.class', 'pf-m-disabled');
        });
    });

    it('checkbox unchecking removes all checks from rows', () => {
      cy.ouiaId(BULK_SELECT).find('input').click().should('be.checked');

      cy.ouiaId(BULK_SELECT).find('input').click();
      cy.ouiaId(BULK_SELECT)
        .find('label.pf-c-dropdown__toggle-check')
        .contains('selected')
        .should('not.exist');
      cy.get(ROOT)
        .find(TBODY)
        .find(ROW)
        .each((row) => {
          cy.wrap(row)
            .find('td')
            .first()
            .find('input')
            .should('not.be.checked');
        });
    });

    it('is updated when checking one row', () => {
      cy.ouiaId(BULK_SELECT).find('input').should('not.be.checked');

      // selecting from rows display the correct text
      cy.get(ROOT)
        .find(TBODY)
        .find(ROW)
        .first()
        .find('td')
        .first()
        .find('input')
        .click();

      cy.ouiaId(BULK_SELECT).find('input').should('not.be.checked');

      cy.ouiaId(BULK_SELECT)
        .find('label.pf-c-dropdown__toggle-check')
        .contains(`1 selected`);
    });

    it('has buttons to select none or all', () => {
      cy.ouiaId(BULK_SELECT).find('button').click();
      cy.ouiaId(BULK_SELECT)
        .find('ul li')
        .should(($lis) => {
          expect($lis).to.have.length(2);
          expect($lis.eq(0)).to.contain('0');
          expect($lis.eq(1)).to.contain(`${data['enabled'].length}`);
        });
    });

    it('button can select all', () => {
      cy.ouiaId(BULK_SELECT).find('button').click();
      cy.ouiaId(BULK_SELECT).find('ul li').contains('all').click();

      cy.ouiaId(BULK_SELECT).find('input').should('be.checked');
      // contains right text
      cy.ouiaId(BULK_SELECT)
        .find('label.pf-c-dropdown__toggle-check')
        .contains(`${data['enabled'].length} selected`);
      // checks all rows
      cy.get(ROOT)
        .find(TBODY)
        .find(ROW)
        .each((row) => {
          cy.wrap(row).find('td').first().find('input').should('be.checked');
        });
      // bulk disabling button is enabled
      cy.get(TOOLBAR)
        .find('.pf-m-spacer-sm')
        .find(DROPDOWN)
        .within((el) => {
          cy.wrap(el).click();
          cy.get('button')
            .contains('Disable recommendation for selected clusters')
            .should('not.have.class', 'pf-m-disabled');
        });
    });

    it('button can select none', () => {
      cy.ouiaId(BULK_SELECT).find('input').click();
      cy.ouiaId(BULK_SELECT).find('button').click();
      cy.ouiaId(BULK_SELECT).find('ul li').contains('none').click();

      cy.ouiaId(BULK_SELECT).find('input').should('not.be.checked');
      // checks all rows
      cy.get(ROOT)
        .find(TBODY)
        .find(ROW)
        .each((row) => {
          cy.wrap(row)
            .find('td')
            .first()
            .find('input')
            .should('not.be.checked');
        });
      // bulk disabling button is enabled
      cy.get(TOOLBAR)
        .find('.pf-m-spacer-sm')
        .find(DROPDOWN)
        .within((el) => {
          cy.wrap(el).click();
          cy.get('button')
            .contains('Disable recommendation for selected clusters')
            .should('have.class', 'pf-m-disabled');
        });
    });
  });

  describe('pagination', () => {
    it('shows correct total number of clusters', () => {
      checkPaginationTotal(data['enabled'].length);
    });

    it('values are expected ones', () => {
      checkPaginationValues(PAGINATION_VALUES);
    });

    it('can change limit', () => {
      // FIXME: best way to make the loop
      cy.wrap(PAGINATION_VALUES).each((el) => {
        changePagination(el);
        checkRowCounts(ROOT, Math.min(el, filterData().length));
      });
    });

    // TODO check duplicated
    it('can iterate over pages', () => {
      cy.wrap(itemsPerPage()).each((el, index, list) => {
        checkRowCounts(ROOT, el);
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
    // TODO check duplicated
    // TODO remove: the test is not stable for changes in data
    it('sorting the last seen column', () => {
      cy.get(ROOT)
        .find('td[data-key=1]')
        .children()
        .eq(0)
        .should('have.text', 'dd2ef343-9131-46f5-8962-290fdfdf2199');
    });

    // TODO check duplicated
    // TODO remove: the test is not stable for changes in data
    it('sorts N/A in last seen correctly', () => {
      cy.get(ROOT);
      cy.get('.pf-c-table__sort').eq(1).click();
      cy.get(ROOT)
        .find('td[data-key=1]')
        .children()
        .eq(0)
        .should('have.text', 'foobar cluster');
      cy.get('.pf-c-table__sort').eq(1).click();
      cy.get(ROOT)
        .find('td[data-key=1]')
        .children()
        .eq(0)
        .should('have.text', 'dd2ef343-9131-46f5-8962-290fdfdf2199');
    });

    _.zip(['name', 'last_checked_at'], TABLE_HEADERS).forEach(
      ([category, label]) => {
        SORTING_ORDERS.forEach((order) => {
          it(`${order} by ${label}`, () => {
            const col = `td[data-label="${label}"]`;
            const header = `th[data-label="${label}"]`;

            cy.get(col).should(
              'have.length',
              Math.min(DEFAULT_ROW_COUNT, data['enabled'].length)
            );
            if (order === 'ascending') {
              cy.get(header).find('button').click();
            } else {
              cy.get(header).find('button').dblclick();
            }
            // TODO should we check URL as in ClusterListTable?

            // add property name to clusters
            let sortedClusters = _.cloneDeep(data['enabled']);
            sortedClusters.forEach(
              (it) =>
                (it['name'] = it['cluster_name']
                  ? it['cluster_name']
                  : it['cluster'])
            );
            // convert N/A timestamps as really old ones
            sortedClusters.forEach((it) => {
              if (it['last_checked_at'] === '') {
                it['last_checked_at'] = '1970-01-01T01:00:00.001Z';
              }
            });

            if (category === 'name') {
              // name sorting is case insentive
              category = (it) => it.name.toLowerCase();
            }

            sortedClusters = _.map(
              _.orderBy(
                sortedClusters,
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
                sortedClusters.slice(
                  0,
                  Math.min(DEFAULT_ROW_COUNT, sortedClusters.length)
                )
              );
          });
        });
      }
    );
  });

  describe('filtering', () => {
    it('no chips are displayed by default', () => {
      cy.get(CHIP_GROUP).should('not.exist');
      cy.get('button').contains('Reset filters').should('not.exist');
    });

    // outer loop required to clean up filter bar
    SEARCH_ITEMS.forEach((el) => {
      it(`can add name filter (${el})`, () => {
        cy.get(ROOT).find('#name-filter').type(el);
        // renders filter chips
        cy.get(TOOLBAR)
          .find(CHIP_GROUP)
          .should('contain', 'Name')
          .and('contain', el);
        cy.get('button').contains('Reset filters').should('exist');
        // check matched clusters
        cy.wrap(filterData(el)).then((data) => {
          if (data.length === 0) {
            cy.get('table .pf-c-empty-state')
              .should('contain', 'No matching clusters found')
              .and(
                'contain',
                'To continue, edit your filter settings and search again.'
              );
          } else {
            checkRowCounts(ROOT, Math.min(DEFAULT_ROW_COUNT, data.length));
          }
        });
      });
    });

    it('can Reset filters', () => {
      cy.get(ROOT).find('#name-filter').type('custom');
      cy.get(TOOLBAR).find('button').contains('Reset filters').click();
      cy.get(TOOLBAR).find(CHIP_GROUP).should('not.exist');
      checkRowCounts(ROOT, Math.min(DEFAULT_ROW_COUNT, filterData().length));
    });
  });

  // TODO check duplicated
  it('can select/deselect all', () => {
    cy.get(TOOLBAR).within(() => {
      cy.get('input[data-ouia-component-id="clusters-selector"]').click();
      cy.get('#toggle-checkbox-text').should(
        'have.text',
        `${filterData().length} selected`
      );
      cy.get('.pf-c-dropdown__toggle').find('button').click();
      cy.get('ul[class=pf-c-dropdown__menu]').find('li').eq(1).click();
      cy.get('#toggle-checkbox-text').should('not.exist');
    });
  });

  // TODO check duplicated
  it('can disable selected clusters', () => {
    cy.get(TOOLBAR)
      .find('input[data-ouia-component-id="clusters-selector"]')
      .click();
    cy.get(TOOLBAR).find('button[aria-label=Actions]').click();
    cy.get('.pf-c-dropdown__menu').find('li').find('button').click();
    cy.get('.pf-c-modal-box')
      .find('.pf-c-check label')
      .should('have.text', 'Disable recommendation for selected clusters');
  });

  // TODO check duplicated
  it('can disable one cluster', () => {
    cy.get(ROOT)
      .find(TBODY)
      .find(ROW)
      .eq(0)
      .find('.pf-c-table__action button')
      .click();
    cy.get(ROOT)
      .find(TBODY)
      .find(ROW)
      .eq(0)
      .find('.pf-c-dropdown__menu button')
      .click();
    cy.get('.pf-c-modal-box')
      .find('.pf-c-check label')
      .should('have.text', 'Disable only for this cluster');
  });

  describe('modal for bulk disabling', () => {
    beforeEach(() => {
      cy.intercept(
        'PUT',
        '/api/insights-results-aggregator/v1/clusters/**/rules/**/error_key/**/disable',
        {
          statusCode: 200,
        }
      ).as('disableRequest');
      cy.intercept(
        'POST',
        '/api/insights-results-aggregator/v1/clusters/**/rules/**/error_key/**/disable_feedback',
        {
          statusCode: 200,
        }
      ).as('disableFeedbackRequest');
    });

    it('modal for bulk disabling', () => {
      cy.ouiaId(BULK_SELECT).find('input').click().should('be.checked');

      cy.get(TOOLBAR)
        .find('.pf-m-spacer-sm')
        .find(DROPDOWN)
        .within((el) => {
          cy.wrap(el).click();
          cy.get('button')
            .contains('Disable recommendation for selected clusters')
            .click();
        });

      cy.get(MODAL).find(CHECKBOX).should('be.checked');

      cy.get(MODAL).find('button[data-ouia-component-id="confirm"]').click();
      // Should catch at least one PUT and at least one POST requests after clusters rule disable
      cy.wait('@disableRequest');
      cy.wait('@disableFeedbackRequest');
      // TODO check page is reloaded afterwards

      // can check the number of request for disable because all occur before @disableFeedbackRequest
      cy.get('@disableRequest.all')
        .its('length')
        .should('equal', data['enabled'].length);
      // cannot check the number of request because we miss a waiting condition
      // cy.get('@disableFeedbackRequest.all').its('length').should('equal', data['enabled'].length);
    });

    it('modal cancel does not trigger anything', () => {
      cy.ouiaId(BULK_SELECT).find('input').click().should('be.checked');

      cy.get(TOOLBAR)
        .find('.pf-m-spacer-sm')
        .find(DROPDOWN)
        .within((el) => {
          cy.wrap(el).click();
          cy.get('button')
            .contains('Disable recommendation for selected clusters')
            .click();
        });

      cy.get(MODAL).find('button').contains('Cancel').click();

      // TODO check that request is not send
    });

    it('modal for cluster disabling', () => {
      cy.get(ROOT)
        .find(TBODY)
        .find(ROW)
        .first()
        .find('td')
        .eq(3)
        .click()
        .contains('Disable')
        .click();

      cy.get(MODAL).find(CHECKBOX).should('be.checked');

      cy.get(MODAL).find('button[data-ouia-component-id="confirm"]').click();
      // Should catch at one PUT and at one POST requests after clusters rule disable
      cy.wait('@disableRequest');
      cy.wait('@disableFeedbackRequest');
      // TODO check page is reloaded afterwards
    });
  });
});

describe('empty successful affected clusters table', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <AffectedClustersTable
              query={{
                isError: false,
                isFetching: false,
                isUninitialized: false,
                isSuccess: true,
                data: { disabled: [], enabled: [] },
              }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('cannot add filters to empty table', () => {
    cy.get(ROOT).find('#name-filter').type('foobar');
    cy.get(TOOLBAR).find(CHIP_GROUP).should('not.exist');
  });

  it('renders no clusters message', () => {
    cy.get('#empty-state-message')
      .find('h4')
      .should('have.text', 'No clusters');
  });

  it('renders table headers', () => {
    checkTableHeaders(TABLE_HEADERS);
  });
});

describe('empty failed affected clusters table', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <AffectedClustersTable
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

  it('cannot add filters to empty table', () => {
    cy.get(ROOT).find('#name-filter').type('foobar');
    cy.get(TOOLBAR).find(CHIP_GROUP).should('not.exist');
  });

  it('renders error message', () => {
    cy.get('#error-state-message')
      .find('h4')
      .should('have.text', 'Something went wrong');
  });

  it('renders table header', () => {
    cy.get(ROOT).find('th').children().eq(0).should('have.text', 'Name');
    cy.get(ROOT).find('th').children().eq(1).should('have.text', 'Last seen');
  });
});
