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

function checkRowCounts(tableLocator, n) {
  return cy.get(tableLocator).find(TBODY).find(ROW).should('have.length', n);
}

export { checkTableHeaders, checkRowCounts };
