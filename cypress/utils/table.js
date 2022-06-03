import _ from 'lodash';

import { ROW, TABLE, TBODY, TITLE } from './components';

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

function checkNoMatchState(isRecsList) {
  cy.get(TABLE)
    .find('[ouiaid=empty-state]')
    .should('have.length', 1)
    .within(() => {
      cy.get('.pf-c-empty-state__icon').should('have.length', 0);
      cy.get(`h5${TITLE}`).should(
        'have.text',
        `No matching ${isRecsList ? 'recommendations' : 'clusters'} found`
      );
      cy.get('.pf-c-empty-state__body').should(
        'have.text',
        'To continue, edit your filter settings and search again.'
      );
    });
}

export {
  checkTableHeaders,
  checkRowCounts,
  columnName2UrlParam,
  tableIsSortedBy,
  checkNoMatchState,
};
