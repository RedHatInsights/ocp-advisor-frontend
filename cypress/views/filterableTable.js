import { Widget } from '../widgets/widgets';

const TOOLBAR = 'div[id="ins-primary-data-toolbar"]';
const PAGINATION = 'div[data-ouia-component-type="PF4/Pagination"]';
const PAGINATION_MENU = `${TOOLBAR} ${PAGINATION} div[data-ouia-component-type="PF4/PaginationOptionsMenu"]`;
const PAGINATION_NEXT = `${TOOLBAR} ${PAGINATION} button[data-action="next"]`;
const CHIPS = `${TOOLBAR} div[data-ouia-component-type="PF4/ChipGroup"]`;
const EMPTY_STATE = 'table .pf-c-empty-state';
const TOGGLE_CHECKBOX = `${TOOLBAR} [data-ouia-component-id="clusters-selector-toggle-checkbox"]`;
const TOGGLE_CHECKBOX_TEXT = `${TOOLBAR} #toggle-checkbox-text`;

class Rows extends Widget {
  locator = 'tbody[role=rowgroup] [data-ouia-component-type="PF4/TableRow"]';
  checkCounts = function (n) {
    this.locate().should('have.length', n);
  };
}

class Table extends Widget {
  locator = 'table';
  headers = Widget.nested(this, new Widget('th'));
  emptyState = Widget.nested(this, new Widget('.pf-c-empty-state'));
  rows = Widget.nested(this, Rows);
}

class Pagination extends Widget {
  locator = `${PAGINATION}`;
  checkValues = function (expected) {
    this.locate()
      .find(
        'div[data-ouia-component-type="PF4/PaginationOptionsMenu"] button[data-ouia-component-type="PF4/DropdownToggle"]'
      )
      .click();
    this.locate()
      .find('ul[class=pf-c-options-menu__menu]')
      .find('li')
      .each(($el, index) => {
        cy.wrap($el).should('have.text', `${expected[index]} per page`);
      });
  };
  changeValue = function (value) {
    this.locate()
      .find(
        'div[data-ouia-component-type="PF4/PaginationOptionsMenu"] button[data-ouia-component-type="PF4/DropdownToggle"]'
      )
      .click();
    this.locate()
      .find('ul[class=pf-c-options-menu__menu]')
      .find('[data-ouia-component-type="PF4/DropdownItem"]')
      .contains(`${value}`)
      .click({ force: true }); // caused by the css issue
  };
  nextButton = Widget.nested(this, new Widget('button[data-action="next"]'));
}

class Toolbar extends Widget {
  locator = TOOLBAR;
  pagination = Widget.nested(this, Pagination);
  toggleCheckbox = Widget.nested(
    this,
    new Widget('[data-ouia-component-id="clusters-selector-toggle-checkbox"]')
  );
  toggleCheckboxText = Widget.nested(this, new Widget('#toggle-checkbox-text'));
  chips = Widget.nested(
    this,
    new Widget('div[data-ouia-component-type="PF4/ChipGroup"]')
  );
}

class FilterableTable extends Widget {
  // we do not provide any locator because
  // it is an overkill for component testing

  table = Widget.nested(this, Table);
  toolbar = Widget.nested(this, Toolbar);
}

const filterableTable = {
  isDisplayed: (id) =>
    cy
      .get(`div[id=${id}]`)
      .within(($div) => {
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
      .find('[data-ouia-component-type="PF4/TableRow"]'),
  checkRowCounts: (n) =>
    cy
      .get('table tbody[role=rowgroup]')
      .find('[data-ouia-component-type="PF4/TableRow"]')
      .should('have.length', n),
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

export { filterableTable, FilterableTable };
