const TOOLBAR = 'div[id="ins-primary-data-toolbar"]';
const PAGINATION = 'div[data-ouia-component-type="PF4/Pagination"]';
const PAGINATION_MENU = `${TOOLBAR} ${PAGINATION} div[data-ouia-component-type="PF4/PaginationOptionsMenu"]`;
const PAGINATION_NEXT = `${TOOLBAR} ${PAGINATION} button[data-action="next"]`;
const CHIPS = `${TOOLBAR} div[data-ouia-component-type="PF4/ChipGroup"]`;
const EMPTY_STATE = 'table .pf-c-empty-state';

const filtrableTable = {
  id: null, // to be filled by build method
  isDisplayed: function () {
    // FIXME makes sense to wrap all calls within a get(`div[id=${this.id}]`)?
    cy.get(`div[id=${this.id}]`)
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
  rows: () => {
    return cy
      .get('table tbody[role=rowgroup]')
      .find('[data-ouia-component-type="PF4/TableRow"]');
  },
  checkRowCounts: (n) => {
    cy.get('table tbody[role=rowgroup]')
      .find('[data-ouia-component-type="PF4/TableRow"]')
      .should('have.length', n);
  },
  headers: () => {
    return cy.get('table').find('th');
  },
  chips: () => {
    return cy.get(CHIPS);
  },
  toolbar: () => {
    return cy.get(TOOLBAR);
  },
  emptyState: () => {
    return cy.get(`${EMPTY_STATE}`);
  },
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
    nextButton: () => {
      return cy.get(PAGINATION_NEXT);
    },
  },
};

function build(id) {
  const data = filtrableTable;
  data.id = id;
  return data;
}

export { build };
