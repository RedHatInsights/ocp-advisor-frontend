import _ from 'lodash';

import { ROW, TBODY, TABLE, TITLE } from './components';

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
    .find('[ouiaid=empty-state]')
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
 * A column is sorted and then data and a reference column (which can be different than the
 * sorting one) are compared to see if order matches
 *
 * @param {Object} data - following order from API response and complemented with any
 * modification needed
 * @param {*} field - key in the data to sort by, or function
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
    cy.get(header)
      .find('button')
      .click()
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
    _.orderBy(data, [sortingField], [order === 'descending' ? 'desc' : 'asc']),
    dataField
  );
  cy.get(`td[data-label="${columnField}"]`)
    .then(($els) => {
      return _.map(Cypress.$.makeArray($els), 'innerText');
    })
    .should('deep.equal', sortedValues.slice(0, nExpectedRows));
}

export {
  checkTableHeaders,
  checkRowCounts,
  columnName2UrlParam,
  tableIsSortedBy,
  checkEmptyState,
  checkNoMatchingClusters,
  checkNoMatchingRecs,
  checkSorting,
};
