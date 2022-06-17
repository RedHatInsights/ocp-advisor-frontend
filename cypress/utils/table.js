import _ from 'lodash';

import { ROW, TBODY, TABLE, TITLE, CHIP_GROUP, CHIP } from './components';
import { removeAllChips, applyFilters, filter } from './filters';

function checkTableHeaders(expectedHeaders) {
  /* patternfly/react-table-4.71.16, for some reason, renders extra empty `th` container;
       thus, it is necessary to look at the additional `scope` attr to distinguish between visible columns
    */
  return cy
    .get('table th[scope="col"]')
    .then(($els) => {
      return _.map(Cypress.$.makeArray($els), 'innerText');
    })
    .should('deep.equal', expectedHeaders);
}

// TODO function to get all rows

// TODO fucntion to get rowgroup

function checkRowCounts(n, isSelectableTable = false) {
  return isSelectableTable
    ? cy.get('table').find(TBODY).should('have.length', n)
    : cy.get('table').find(TBODY).find(ROW).should('have.length', n);
}

function columnName2UrlParam(name) {
  return name.toLowerCase().replace(/ /g, '_');
}

function tableIsSortedBy(columnTitle) {
  return cy
    .get('table')
    .find(`th[data-label="${columnTitle}"]`)
    .should('have.class', 'pf-c-table__sort pf-m-selected');
}

function checkEmptyState(title, checkIcon = false) {
  checkRowCounts(1);
  cy.get(TABLE)
    .ouiaId('empty-state')
    .should('have.length', 1)
    .within(() => {
      cy.get('.pf-c-empty-state__icon').should(
        'have.length',
        checkIcon ? 1 : 0
      );
      cy.get(`h5${TITLE}`).should('have.text', title);
    });
}

function checkNoMatchingClusters() {
  return checkEmptyState('No matching clusters found');
}

function checkNoMatchingRecs() {
  return checkEmptyState('No matching recommendations found');
}

/**
 * Check filtering works by removing all existing chips, adding some filters,
 * validating the data, and the chips.
 *
 * @param {*} filters - object with filters and their config
 * @param {@FiltersConf} filtersConf
 * @param {*} values - array of values to compare
 * @param {string} columnName - identifier of the column to be used to validate data
 * @param {*} tableHeaders - header of the table
 * @param {string} emptyStateTitle - title to check on empty state
 * @param {boolean} validateURL - whether to validate URL parameters
 */
function checkFiltering(
  filters,
  filtersConf,
  values,
  columnName,
  tableHeaders,
  emptyStateTitle,
  validateURL,
  hasDefaultFilters
) {
  if (hasDefaultFilters) {
    removeAllChips();
  }
  applyFilters(filters, filtersConf);

  if (values.length === 0) {
    checkEmptyState(emptyStateTitle);
    checkTableHeaders(tableHeaders);
  } else {
    cy.get(`td[data-label="${columnName}"]`)
      .then(($els) => {
        return _.map(Cypress.$.makeArray($els), 'innerText');
      })
      .should('deep.equal', values);
  }

  // validate chips and url params
  cy.get(CHIP_GROUP)
    .should('have.length', Object.keys(filters).length)
    .then(() => {
      if (validateURL) {
        for (const [k, v] of Object.entries(filtersConf)) {
          if (k in filters) {
            const urlValue = v.urlValue(filters[k]);
            expect(window.location.search).to.contain(
              `${v.urlParam}=${urlValue}`
            );
          } else {
            expect(window.location.search).to.not.contain(`${v.urlParam}=`);
          }
        }
      }
    });

  // check chips
  for (const [k, v] of Object.entries(filters)) {
    let groupName = filtersConf[k].selectorText;
    const nExpectedItems = filtersConf[k].type === 'checkbox' ? v.length : 1;
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
}

export {
  checkTableHeaders,
  checkRowCounts,
  columnName2UrlParam,
  tableIsSortedBy,
  checkEmptyState,
  checkNoMatchingClusters,
  checkNoMatchingRecs,
  checkFiltering,
};
