import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import _ from 'lodash';
import { compare } from 'semver';

import { AffectedClustersTable } from './AffectedClustersTable';
import clusterDetailData from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule/external.rules.rule|ERROR_KEY/clusters_detail.json';
import { Intl } from '../../Utilities/intlHelper';
import getStore from '../../Store';
import {
  TOOLBAR,
  ROW,
  PAGINATION,
  CHIP_GROUP,
  DROPDOWN,
  MODAL,
  CHECKBOX,
  TBODY,
  TABLE,
  TOOLBAR_FILTER,
  DROPDOWN_TOGGLE,
  DROPDOWN_ITEM,
  ouiaId,
} from '../../../cypress/utils/components';
import {
  DEFAULT_ROW_COUNT,
  PAGINATION_VALUES,
} from '../../../cypress/utils/defaults';
import { SORTING_ORDERS } from '../../../cypress/utils/globals';
import {
  checkTableHeaders,
  checkRowCounts,
  tableIsSortedBy,
} from '../../../cypress/utils/table';
import {
  itemsPerPage,
  checkPaginationTotal,
  checkPaginationValues,
  changePagination,
} from '../../../cypress/utils/pagination';
import rule from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule/external.rules.rule|ERROR_KEY.json';
import { AFFECTED_CLUSTERS_COLUMNS } from '../../AppConstants';
import { VERSION_COMBINATIONS } from '../../../cypress/utils/filters';

// selectors
const ROOT = 'div[id=affected-list-table]';
const BULK_SELECT = 'clusters-selector';
const SEARCH_ITEMS = ['ff', 'CUSTOM', 'Foobar', 'Not existing cluster'];
const TABLE_HEADERS = _.map(AFFECTED_CLUSTERS_COLUMNS, (it) => it.title);

let data = _.cloneDeep(clusterDetailData.data['enabled']);
data.forEach(
  (it) => (it['name'] = it['cluster_name'] ? it['cluster_name'] : it['cluster'])
);
// default sorting
data = _.orderBy(data, ['last_checked_at'], ['desc']);

function filterData(text = '') {
  return _.filter(data, (it) =>
    it.name.toLowerCase().includes(text.toLowerCase())
  );
}

describe('test data', () => {
  it('has enabled clusters', () => {
    cy.wrap(data).its('length').should('be.gte', 1);
  });
  it('has more enabled clusters than default rows', () => {
    cy.wrap(data).its('length').should('be.gt', DEFAULT_ROW_COUNT);
  });
  it('has less data than 51', () => {
    // 50 is the value [2] in pagination
    cy.wrap(data).its('length').should('be.lte', 50);
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
  _.uniq(_.flatten(VERSION_COMBINATIONS)).map((c) =>
    it(`has at least one cluster with version ${c}`, () => {
      cy.wrap(_.filter(data, (it) => it.meta.cluster_version === c))
        .its('length')
        .should('be.gte', 1);
    })
  );
  it(`has at least one cluster without a version`, () => {
    cy.wrap(_.filter(data, (it) => it.meta.cluster_version === ''))
      .its('length')
      .should('be.gte', 1);
  });
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
                data: clusterDetailData.data,
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
      cy.get(TABLE).should('have.length', 1);
      cy.ouiaType('RHI/TableToolbar').should('have.length', 1);
    });
  });

  it('renders table header', () => {
    checkTableHeaders(TABLE_HEADERS);
  });

  it('rows show cluster names instead uuids when available', () => {
    const names = _.map(data, 'name');
    cy.get(`td[data-label="Name"]`)
      .then(($els) => {
        return _.map(Cypress.$.makeArray($els), 'innerText');
      })
      .should('deep.equal', names.slice(0, DEFAULT_ROW_COUNT));
  });

  it('names of rows are links', () => {
    cy.get(TBODY)
      .children()
      .each(($el, index) => {
        cy.wrap($el)
          .find('td[data-label=Name]')
          .find(`a[href*="/clusters/${data[index]['cluster']}"]`)
          .should('have.text', data[index]['name']);
      });
  });

  describe('defaults', () => {
    it(`shows ${DEFAULT_ROW_COUNT} clusters only`, () => {
      checkRowCounts(DEFAULT_ROW_COUNT);
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
      tableIsSortedBy('Last seen');
    });
  });

  describe('bulk selector', () => {
    it('checkbox can be clicked', () => {
      cy.ouiaId(BULK_SELECT, 'input').click().should('be.checked');
      // contains right text
      cy.get('#toggle-checkbox-text').contains(
        `${filterData().length} selected`
      );
      // checks all rows
      cy.get(TABLE)
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
            .should('not.have.class', 'pf-m-disabled')
            .click();
        });
      // modal is opened
      cy.get(MODAL).should('have.length', 1);
    });

    it('checkbox is unselected when a row is unselected', () => {
      cy.ouiaId(BULK_SELECT).find('input').click().should('be.checked');
      // removing one row unselects it
      cy.get(TABLE)
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
        .contains(`${data.length - 1} selected`);
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
      cy.get(TABLE)
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
      cy.get(TABLE)
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
          expect($lis.eq(1)).to.contain(`${data.length}`);
        });
    });

    it('button can select all', () => {
      cy.ouiaId(BULK_SELECT).find('button').click();
      cy.ouiaId(BULK_SELECT).find('ul li').contains('all').click();

      cy.ouiaId(BULK_SELECT).find('input').should('be.checked');
      // contains right text
      cy.ouiaId(BULK_SELECT)
        .find('label.pf-c-dropdown__toggle-check')
        .contains(`${data.length} selected`);
      // checks all rows
      cy.get(TABLE)
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
      cy.get(TABLE)
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
      cy.get('#toggle-checkbox-text').should('not.exist');
    });
  });

  describe('pagination', () => {
    it('shows correct total number of clusters', () => {
      checkPaginationTotal(data.length);
    });

    it('values are expected ones', () => {
      checkPaginationValues(PAGINATION_VALUES);
    });

    it('can change limit', () => {
      // FIXME: best way to make the loop
      cy.wrap(PAGINATION_VALUES).each((el) => {
        changePagination(el);
        checkRowCounts(Math.min(el, filterData().length));
      });
    });

    it('can iterate over pages', () => {
      cy.wrap(itemsPerPage(filterData().length)).each((el, index, list) => {
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
  });

  describe('sorting', () => {
    _.zip(
      ['name', 'meta.cluster_version', 'last_checked_at'],
      TABLE_HEADERS
    ).forEach(([category, label]) => {
      SORTING_ORDERS.forEach((order) => {
        it(`${order} by ${label}`, () => {
          const col = `td[data-label="${label}"]`;
          const header = `th[data-label="${label}"]`;

          cy.get(col).should(
            'have.length',
            Math.min(DEFAULT_ROW_COUNT, data.length)
          );
          if (order === 'ascending') {
            cy.get(header).find('button').click();
          } else {
            cy.get(header).find('button').dblclick();
          }

          // add property name to clusters
          let sortedClusters = _.cloneDeep(
            clusterDetailData.data['enabled'].map((it) => ({
              ...it,
              name: it['cluster_name'] ? it['cluster_name'] : it['cluster'],
            }))
          );
          // convert N/A timestamps as really old ones
          sortedClusters.forEach((it) => {
            if (it['last_checked_at'] === '') {
              it['last_checked_at'] = '1970-01-01T01:00:00.001Z';
            }
            if (it.meta.cluster_version === '') {
              it.meta.cluster_version = '0.0.0';
            }
          });

          if (category === 'name') {
            // name sorting is case insensitive
            category = (it) => it.name.toLowerCase();
          }

          sortedClusters = _.map(
            category === 'meta.cluster_version'
              ? sortedClusters.sort(
                  (a, b) =>
                    (order === 'ascending' ? 1 : -1) *
                    compare(a.meta.cluster_version, b.meta.cluster_version)
                )
              : _.orderBy(
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
            .should('deep.equal', sortedClusters.slice(0, DEFAULT_ROW_COUNT));
        });
      });
    });
  });

  describe('filtering', () => {
    // TODO: use filtersConf approach
    it('no chips are displayed by default', () => {
      cy.get(CHIP_GROUP).should('not.exist');
      cy.get('button').contains('Reset filters').should('not.exist');
    });

    // outer loop required to clean up filter bar
    SEARCH_ITEMS.forEach((el) => {
      it(`can add name filter (${el})`, () => {
        cy.get('#name-filter').type(el);
        // renders filter chips
        cy.get(TOOLBAR)
          .find(CHIP_GROUP)
          .should('contain', 'Name')
          .and('contain', el);
        cy.get('button').contains('Reset filters').should('exist');
        // check matched clusters
        cy.wrap(filterData(el)).then((data) => {
          if (data.length === 0) {
            cy.get(`${TABLE} .pf-c-empty-state`)
              .should('contain', 'No matching clusters found')
              .and(
                'contain',
                'To continue, edit your filter settings and search again.'
              );
          } else {
            checkRowCounts(Math.min(DEFAULT_ROW_COUNT, data.length));
          }
        });
      });
    });

    VERSION_COMBINATIONS.forEach((vs) => {
      it(`can filter by versions ${vs}`, () => {
        const filtered = data.filter((it) =>
          vs.includes(it.meta.cluster_version)
        );
        const names = _.map(filtered, 'name');

        cy.get(TOOLBAR_FILTER).find(DROPDOWN_TOGGLE).click();
        cy.get(TOOLBAR_FILTER).find(DROPDOWN_ITEM).eq(1).click();
        // open the versions dropdown
        cy.get(ouiaId('Filter by version')).click();
        vs.forEach((v) =>
          cy
            .get('.pf-c-select__menu')
            .find('.pf-c-select__menu-item')
            .contains(v)
            .click()
        );
        // close the dropdown
        cy.get(ouiaId('Filter by version')).click();
        checkRowCounts(names.length);
        cy.get(`td[data-label="Name"]`)
          .then(($els) => {
            return _.map(Cypress.$.makeArray($els), 'innerText');
          })
          .should(
            'deep.equal',
            names.slice(0, Math.min(DEFAULT_ROW_COUNT, names.length))
          );
      });
    });

    it('can Reset filters', () => {
      cy.get('#name-filter').type('custom');
      cy.get(TOOLBAR).find('button').contains('Reset filters').click();
      cy.get(TOOLBAR).find(CHIP_GROUP).should('not.exist');
      checkRowCounts(Math.min(DEFAULT_ROW_COUNT, filterData().length));
    });
  });

  it('can disable one cluster', () => {
    cy.get(TABLE)
      .find(TBODY)
      .find(ROW)
      .eq(0)
      .find('.pf-c-table__action button')
      .click();
    cy.get(TABLE)
      .find(TBODY)
      .find(ROW)
      .eq(0)
      .find('.pf-c-dropdown__menu button')
      .click();
    cy.get(MODAL).should('have.length', 1);
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
      cy.get('@disableRequest.all').its('length').should('equal', data.length);
      // cannot check the number of request because we miss a waiting condition
      // cy.get('@disableFeedbackRequest.all').its('length').should('equal', data.length);
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
      cy.get(TABLE)
        .find(TBODY)
        .find(ROW)
        .first()
        .find('td')
        .eq(4)
        .click()
        .contains('Disable')
        .click();

      cy.get(MODAL)
        .find('.pf-c-check label')
        .should('have.text', 'Disable only for this cluster');

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
    cy.get('#name-filter').type('foobar');
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
    cy.get('#name-filter').type('foobar');
    cy.get(TOOLBAR).find(CHIP_GROUP).should('not.exist');
  });

  it('renders error message', () => {
    cy.get('#error-state-message')
      .find('h4')
      .should('have.text', 'Something went wrong');
  });

  it('renders table header', () => {
    TABLE_HEADERS.map((h, i) =>
      cy.get(TABLE).find('th').eq(i).should('have.text', h)
    );
  });
});
