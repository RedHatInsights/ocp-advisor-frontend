const TOOLBAR = 'div[id="ins-primary-data-toolbar"]';
const PAGINATION = 'div[data-ouia-component-type="PF4/Pagination"]';
const PAGINATION_MENU = `${TOOLBAR} ${PAGINATION} div[data-ouia-component-type="PF4/PaginationOptionsMenu"]`;
const PAGINATION_NEXT = `${TOOLBAR} ${PAGINATION} button[data-action="next"]`;
const CHIPS = `${TOOLBAR} div[data-ouia-component-type="PF4/ChipGroup"]`;
const EMPTY_STATE = 'table .pf-c-empty-state';
const TOGGLE_CHECKBOX = `${TOOLBAR} [data-ouia-component-id="clusters-selector-toggle-checkbox"]`;
const TOGGLE_CHECKBOX_TEXT = `${TOOLBAR} #toggle-checkbox-text`;

const filterableTable = {
  isDisplayed: (id) => {
    cy.get(`div[id=${id}]`)
      .within(($div) => {
        cy.get(TOOLBAR).should('have.length', 1);
        cy.get('table').should('have.length', 1);
        cy.get('div[data-ouia-component-type="RHI/TableToolbar"]').should(
          'have.length',
          1
        );
      })
      .should('have.length', 1);
  },
  rows: () =>
    cy
      .get('table tbody[role=rowgroup]')
      .find('[data-ouia-component-type="PF4/TableRow"]'),
  checkRowCounts: (n) => {
    cy.get('table tbody[role=rowgroup]')
      .find('[data-ouia-component-type="PF4/TableRow"]')
      .should('have.length', n);
  },
  headers: () => cy.get('table').find('th'),
  chips: () => cy.get(CHIPS),
  toolbar: () => cy.get(TOOLBAR),
  emptyState: () => cy.get(`${EMPTY_STATE}`),
  pagination: {
    checkValues: (expected) => {
      cy.get(PAGINATION_MENU)
        .find('button[data-ouia-component-type="PF4/DropdownToggle"]')
        .click();
      cy.get(PAGINATION_MENU)
        .find('ul[class=pf-c-options-menu__menu]')
        .find('li')
        .each(($el, index) => {
          cy.wrap($el).should('have.text', `${expected[index]} per page`);
        });
    },
    changeValue: (value) => {
      cy.get(PAGINATION_MENU)
        .find('button[data-ouia-component-type="PF4/DropdownToggle"]')
        .click();
      cy.get(PAGINATION_MENU)
        .find('ul[class=pf-c-options-menu__menu]')
        .find('[data-ouia-component-type="PF4/DropdownItem"]')
        .contains(`${value}`)
        .click({ force: true }); // caused by the css issue
    },
    nextButton: () => cy.get(PAGINATION_NEXT),
  },
  toggleCheckbox: () => cy.get(TOGGLE_CHECKBOX),
  toggleCheckboxText: () => cy.get(TOGGLE_CHECKBOX_TEXT),
};

export default filterableTable;
