import { Widget } from '../widgets/widgets';

const TOOLBAR = 'div[id="ins-primary-data-toolbar"]';
const PAGINATION = 'div[data-ouia-component-type="PF4/Pagination"]';

class Rows extends Widget {
  locator = 'tbody[role=rowgroup] [data-ouia-component-type="PF4/TableRow"]';
  checkCounts = function (n) {
    this.locate().should('have.length', n);
  };
}

class Table extends Widget {
  locator = 'table';
  headers = this.nested(new Widget('th'));
  emptyState = this.nested(new Widget('.pf-c-empty-state'));
  rows = this.nested(Rows);
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
  nextButton = this.nested(new Widget('button[data-action="next"]'));
}

class Toolbar extends Widget {
  locator = TOOLBAR;
  pagination = this.nested(Pagination);
  toggleCheckbox = this.nested(
    new Widget('[data-ouia-component-id="clusters-selector-toggle-checkbox"]')
  );
  toggleCheckboxText = this.nested(new Widget('#toggle-checkbox-text'));
  chips = this.nested(
    new Widget('div[data-ouia-component-type="PF4/ChipGroup"]')
  );
}

class FilterableTable extends Widget {
  // we do not provide any locator because
  // it is an overkill for component testing

  table = this.nested(Table);
  toolbar = this.nested(Toolbar);
}

export { FilterableTable };
