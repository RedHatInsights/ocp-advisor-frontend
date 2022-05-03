import _ from 'lodash';

import { ROW, TBODY } from './components';

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

// TODO remove tableLocator and simply use 'table'
function checkRowCounts(tableLocator, n) {
  return cy.get(tableLocator).find(TBODY).find(ROW).should('have.length', n);
}

function columnName2UrlParam(name) {
  return name.toLowerCase().replace(/ /g, '_');
}

export { checkTableHeaders, checkRowCounts, columnName2UrlParam };
