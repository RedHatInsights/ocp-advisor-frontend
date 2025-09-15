// TODO: replace utils with the utils library from FEC

import { DEFAULT_ROW_COUNT } from './defaults';
import {
  TOOLBAR,
  PAGINATION,
  PAGINATION_MENU,
  DROPDOWN_TOGGLE,
  DROPDOWN_ITEM,
} from './components';

// FIXME improve syntax
function itemsPerPage(totalLength, pageSize = DEFAULT_ROW_COUNT) {
  let items = totalLength;
  const array = [];
  while (items > 0) {
    const remain = items - pageSize;
    let v = remain > 0 ? pageSize : items;
    array.push(v);
    items = remain;
  }
  return array;
}

function checkPaginationTotal(n) {
  return cy
    .get('.pf-v6-c-menu-toggle__text')
    .find('b')
    .eq(1)
    .should('have.text', n);
}

function checkCurrentPage(page) {
  cy.get(PAGINATION)
    .find('[aria-label="Current page"]')
    .should('have.value', `${page}`);
}

function checkPaginationSelected(index) {
  cy.get(TOOLBAR).find(PAGINATION_MENU).find(DROPDOWN_TOGGLE).click();
  cy.get('ul[class=pf-v6-c-menu__list]')
    .children()
    .eq(index)
    .find('button')
    .should('have.class', 'pf-v6-c-menu__item pf-m-selected');
}

function checkPaginationValues(expectedValues) {
  cy.get(TOOLBAR).find(PAGINATION_MENU).find(DROPDOWN_TOGGLE).click();
  cy.get('ul[class=pf-v6-c-menu__list]')
    .find('li')
    .each(($el, index) => {
      cy.wrap($el).should('have.text', `${expectedValues[index]} per page`);
    });
}

function changePagination(textInItem) {
  cy.get(TOOLBAR).find(PAGINATION_MENU).find(DROPDOWN_TOGGLE).click();
  return cy
    .get('ul[class=pf-v6-c-menu__list]')
    .find(DROPDOWN_ITEM)
    .contains(`${textInItem}`)
    .click();
}

export {
  itemsPerPage,
  checkPaginationTotal,
  checkCurrentPage,
  checkPaginationSelected,
  checkPaginationValues,
  changePagination,
};
