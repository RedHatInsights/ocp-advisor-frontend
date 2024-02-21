// TODO: replace utils with the utils library from FEC

const TOOLBAR = 'div[id="ins-primary-data-toolbar"]';
const CHIP_GROUP = 'div[data-ouia-component-type="PF5/ChipGroup"]';
const CHIP = '[data-ouia-component-type="PF5/Chip"]';
const ROW =
  '[data-ouia-component-type="PF5/TableRow"]:not([class~="pf-v5-c-table__expandable-row"])';
const PAGINATION = 'div[data-ouia-component-type="PF5/Pagination"]';
const PAGINATION_BOTTOM = '.pf-m-bottom';
const PAGINATION_MENU = 'div[data-ouia-component-type="PF5/Pagination"]';
const DROPDOWN = '[data-ouia-component-type="PF5/Dropdown"]';
const MODAL = '[data-ouia-component-type="PF5/ModalContent"]';
const CHECKBOX = '[data-ouia-component-type="PF5/Checkbox"]';
const TEXT_INPUT = '[data-ouia-component-type="PF5/TextInput"]';
const DROPDOWN_TOGGLE = '.pf-v5-c-menu-toggle';
const DROPDOWN_ITEM = '.pf-v5-c-menu__item';
const TBODY = 'tbody[role=rowgroup]';
const TOOLBAR_FILTER = '.ins-c-primary-toolbar__filter';
const TABLE = 'table';
const TABLE_HEADER = 'thead';
const ROWS_TOGGLER = `${TABLE_HEADER} .pf-v5-c-table__toggle`;
const TITLE = '.pf-v5-c-empty-state__title-text';
const ouiaId = (id) => `[data-ouia-component-id="${id}"]`;

export {
  ouiaId,
  TOOLBAR,
  CHIP_GROUP,
  CHIP,
  ROW,
  PAGINATION,
  PAGINATION_BOTTOM,
  PAGINATION_MENU,
  DROPDOWN,
  MODAL,
  CHECKBOX,
  TEXT_INPUT,
  DROPDOWN_TOGGLE,
  DROPDOWN_ITEM,
  TBODY,
  TOOLBAR_FILTER,
  TABLE,
  TABLE_HEADER,
  ROWS_TOGGLER,
  TITLE,
};
