import _ from 'lodash';

import {
  ROW,
  TBODY,
  TOOLBAR,
  PAGINATION_MENU,
  DROPDOWN_TOGGLE,
  DROPDOWN_ITEM,
} from './components';

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

function checkPaginationTotal(n) {
  return cy
    .get('.pf-c-options-menu__toggle-text')
    .find('b')
    .eq(1)
    .should('have.text', n);
}

function checkPaginationValues(expectedValues) {
  cy.get(TOOLBAR).find(PAGINATION_MENU).find(DROPDOWN_TOGGLE).click();
  cy.get(TOOLBAR)
    .find(PAGINATION_MENU)
    .find('ul[class=pf-c-options-menu__menu]')
    .find('li')
    .each(($el, index) => {
      cy.wrap($el).should('have.text', `${expectedValues[index]} per page`);
    });
}

function changePagination(textInItem) {
  cy.get(TOOLBAR).find(PAGINATION_MENU).find(DROPDOWN_TOGGLE).click();
  return cy
    .get(TOOLBAR)
    .find(PAGINATION_MENU)
    .find('ul[class=pf-c-options-menu__menu]')
    .find(DROPDOWN_ITEM)
    .contains(`${textInItem}`)
    .click();
}

function checkRowCounts(tableLocator, n) {
  return cy.get(tableLocator).find(TBODY).find(ROW).should('have.length', n);
}

export {
  checkTableHeaders,
  checkPaginationTotal,
  checkPaginationValues,
  changePagination,
  checkRowCounts,
};
