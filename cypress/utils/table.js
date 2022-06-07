import _ from 'lodash';

import { ROW, TABLE_HEADER, TBODY } from './components';

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

function checkRowCounts(n) {
  return cy.get('table').find(TBODY).find(ROW).should('have.length', n);
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

export {
  checkTableHeaders,
  checkRowCounts,
  columnName2UrlParam,
  tableIsSortedBy,
};
