const TOOLBAR = 'div[id="ins-primary-data-toolbar"]';
const PAGINATION = 'div[data-ouia-component-type="PF6/Pagination"]';
const PAGINATION_MENU = `${TOOLBAR} ${PAGINATION} div[data-ouia-component-type="PF6/PaginationOptionsMenu"]`;
const PAGINATION_NEXT = `${TOOLBAR} ${PAGINATION} button[data-action="next"]`;
const CHIPS = `${TOOLBAR} div[data-ouia-component-type="PF6/ChipGroup"]`;
const CHIP_GROUP = 'div[data-ouia-component-type="PF6/ChipGroup"]';
const CHIP = '[data-ouia-component-type="PF6/Chip"]';
const EMPTY_STATE = 'table .pf-v6-c-empty-state';
const TOGGLE_CHECKBOX = `${TOOLBAR} [data-ouia-component-id="clusters-selector-toggle-checkbox"]`;
const TOGGLE_CHECKBOX_TEXT = `${TOOLBAR} #toggle-checkbox-text`;
const ROWS = '[data-ouia-component-type="PF6/TableRow"]';

function checkRowCounts(n) {
  return cy
    .get('table tbody[role=rowgroup]')
    .find(ROWS)
    .should('have.length', n);
}

const filterableTable = {
  isDisplayed: (id) =>
    cy
      .get(`div[id=${id}]`)
      .within(() => {
        cy.get(TOOLBAR).should('have.length', 1);
        cy.get('table').should('have.length', 1);
        cy.get('div[data-ouia-component-type="RHI/TableToolbar"]').should(
          'have.length',
          1
        );
      })
      .should('have.length', 1),
  rows: () =>
    cy
      .get('table tbody[role=rowgroup]')
      .find('[data-ouia-component-type="PF6/TableRow"]'),
  checkRowCounts: (n) =>
    cy
      .get('table tbody[role=rowgroup]')
      .find('[data-ouia-component-type="PF6/TableRow"]')
      .should('have.length', n),
  headers: () => cy.get('table').find('th'),
  chips: () => cy.get(CHIPS),
  toolbar: () => cy.get(TOOLBAR),
  emptyState: () => cy.get(`${EMPTY_STATE}`),
  pagination: {
    checkValues: (expected) => {
      cy.get(PAGINATION_MENU)
        .find('button[data-ouia-component-type="PF6/DropdownToggle"]')
        .click();
      cy.get(PAGINATION_MENU)
        .find('ul[class=pf-v6-c-options-menu__menu]')
        .find('li')
        .each(($el, index) => {
          cy.wrap($el).should('have.text', `${expected[index]} per page`);
        });
    },
    changeValue: (value) => {
      cy.get(PAGINATION_MENU)
        .find('button[data-ouia-component-type="PF6/DropdownToggle"]')
        .click();
      cy.get(PAGINATION_MENU)
        .find('ul[class=pf-v6-c-options-menu__menu]')
        .find('[data-ouia-component-type="PF6/DropdownItem"]')
        .contains(`${value}`)
        .click();
    },
    nextButton: () => cy.get(PAGINATION_NEXT),
  },
  toggleCheckbox: () => cy.get(TOGGLE_CHECKBOX),
  toggleCheckboxText: () => cy.get(TOGGLE_CHECKBOX_TEXT),
};

export { filterableTable, CHIP_GROUP, CHIP, ROWS, checkRowCounts };
