// TODO: replace utils with the utils library from FEC

import _ from 'lodash';

import { ROW, TBODY, TABLE, CHIP_GROUP, CHIP } from './components';
import { removeAllChips, applyFilters } from './filters';
// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import { checkEmptyState } from '@redhat-cloud-services/frontend-components-utilities';

function checkTableHeaders(expectedHeaders) {
  /* patternfly/react-table-4.71.16, for some reason, renders extra empty `th` container;
       thus, it is necessary to look at the additional `scope` attr to distinguish between visible columns
    */
  return cy
    .get('table th[scope="col"]')
    .then(($els) => {
      return _.map(Cypress.$.makeArray($els), 'innerText');
    })
    .then(($els) => $els.map((el) => el.trim()))
    .should('deep.equal', expectedHeaders);
}

// TODO function to get all rows

// TODO fucntion to get rowgroup

function checkRowGroupCounts(n) {
  return cy.get(TABLE).find(TBODY).should('have.length', n);
}

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
    .should('have.class', 'pf-v5-c-table__sort pf-m-selected');
}

function checkNoMatchingClusters() {
  return checkEmptyState('No matching clusters found');
}

function checkNoMatchingRecs() {
  return checkEmptyState('No matching recommendations found');
}

function checkNoMatchingWorkloads() {
  return checkEmptyState('No matching workloads found');
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
    cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
    cy.get(`td[data-label="${columnName}"]`)
      .should('have.length', values.length)
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

/**
 * A column is sorted and then data and a reference column (which can be different than the
 * sorting one) are compared to see if order matches
 *
 * @param {Object} data - following order from API response and complemented with any
 * modification needed
 * @param {*} sortingField - key in the data to sort by, or function
 * @param {string} label - identifier of the column
 * @param {string} order - ascending or descending
 * @param {string} columnField - identifier of the column to be used in the comparison with the data
 * @param {string} dataField - key in the data to be used in the comparison with the data
 * @param {integer} nExpectedRows - number of expected rows to be displayed in the table
 * @param {string} validateURL - string expected as sort value in URL. If not provided, it is not checked
 */
function checkSorting(
  data,
  sortingField,
  label,
  order,
  columnField,
  dataField,
  nExpectedRows,
  validateURL
) {
  // get appropriate locators
  const col = `td[data-label="${label}"]`;
  const header = `th[data-label="${label}"]`;

  // check number of rows
  cy.get(col).should('have.length', nExpectedRows);

  // sort by column and verify URL
  if (order === 'ascending') {
    cy.get(header)
      .find('button')
      .click()
      .then(() => {
        if (validateURL) {
          expect(window.location.search).to.contain(
            `sort=${columnName2UrlParam(validateURL)}`
          );
        }
      });
  } else {
    cy.get(header).find('button').click();
    cy.get(header)
      .find('button')
      .click() // TODO dblclick fails for unknown reason in RecsListTable when sorting by Clusters
      .then(() => {
        if (validateURL) {
          expect(window.location.search).to.contain(
            `sort=-${columnName2UrlParam(validateURL)}`
          );
        }
      });
  }

  let sortedValues = _.map(
    _.orderBy(
      data,
      sortingField,
      Array(Array.isArray(sortingField) ? sortingField.length : 1).fill(
        order === 'descending' ? 'desc' : 'asc'
      )
    ),
    dataField
  );
  cy.get('[data-ouia-component-id=loading-skeleton]').should('not.exist');
  const expectedLength = sortedValues.slice(0, nExpectedRows).length;
  cy.get(`td[data-label="${columnField}"]`)
    .should('have.length', expectedLength)
    .then(($els) => {
      return _.map(Cypress.$.makeArray($els), 'innerText');
    })
    .should('deep.equal', sortedValues.slice(0, nExpectedRows));
}

export {
  checkTableHeaders,
  checkRowGroupCounts,
  checkRowCounts,
  columnName2UrlParam,
  tableIsSortedBy,
  checkNoMatchingClusters,
  checkNoMatchingRecs,
  checkNoMatchingWorkloads,
  checkFiltering,
  checkSorting,
};
