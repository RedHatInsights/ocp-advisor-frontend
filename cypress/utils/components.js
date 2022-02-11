const TOOLBAR = 'div[id="ins-primary-data-toolbar"]';
const CHIP_GROUP = 'div[data-ouia-component-type="PF4/ChipGroup"]';
const CHIP = '[data-ouia-component-type="PF4/Chip"]';
const ROW = '[data-ouia-component-type="PF4/TableRow"]';
const PAGINATION = 'div[data-ouia-component-type="PF4/Pagination"]';
const PAGINATION_MENU =
  'div[data-ouia-component-type="PF4/PaginationOptionsMenu"]';
const DROPDOWN = '[data-ouia-component-type="PF4/Dropdown"]';
const MODAL = '[data-ouia-component-type="PF4/ModalContent"]';
const CHECKBOX = '[data-ouia-component-type="PF4/Checkbox"]';
const TEXT_INPUT = '[data-ouia-component-type="PF4/TextInput"]';

const ouiaId = (id) => `[data-ouia-component-id="${id}"]`;

export {
  ouiaId,
  TOOLBAR,
  CHIP_GROUP,
  CHIP,
  ROW,
  PAGINATION,
  PAGINATION_MENU,
  DROPDOWN,
  MODAL,
  CHECKBOX,
  TEXT_INPUT,
};
