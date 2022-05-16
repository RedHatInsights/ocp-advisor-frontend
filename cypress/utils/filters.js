/*
Utilities related to URL parameters passed for table filtering
*/

import _ from 'lodash';

import { FILTER_CATEGORIES } from '../../src/AppConstants';

import { CHIP_GROUP, CHIP } from './components';

const FILTERS_DROPDOWN = 'ul[class=pf-c-dropdown__menu]';
const FILTER_TOGGLE = 'span[class=pf-c-select__toggle-arrow]';

/**
 * A filter configuration
 * @typedef {Object} FiltersConf
 * @property {string} selectorText - Text of the selector in the filter's dropdown
 * @property {Array} values - List of values to try
 * @property {string} type - Type of selector: input, checkbox, radio
 * @property {function filterFunc(it, value) {
    @property {Object} it - Data from the API
    @property {Object} value - Instance from the values above
 }} - function describing if a given item should stay or be filtered
 */

/**
 * Apply a given set of filters taken into account the filters configuration
 * @param {*} filters value to set on the filters
 * {key: string (for input/radio) | array (for checkbox)}
 * @param {@FiltersConf} - global configuration of the filter settings
 */
function applyFilters(filters, filtersConf) {
  for (const [key, value] of Object.entries(filters)) {
    const item = filtersConf[key];
    // open filter selector
    cy.get('div.ins-c-primary-toolbar__filter')
      .find('button[class=pf-c-dropdown__toggle]')
      .click({ force: true });

    // select appropriate filter
    cy.get(FILTERS_DROPDOWN).contains(item.selectorText).click({ force: true });

    // fill appropriate filter
    if (item.type === 'input') {
      cy.get('input.ins-c-conditional-filter').type(value);
    } else if (item.type === 'checkbox') {
      cy.get(FILTER_TOGGLE).click({ force: true });
      value.forEach((it) => {
        cy.get('ul[class=pf-c-select__menu]')
          .find('label')
          .contains(it)
          .parent()
          .find('input[type=checkbox]')
          .check({ force: true });
      });
    } else {
      throw `${it.type} not recognized`;
    }
  }
}

function urlParamConvert(key, value) {
  const filterCategory = _.find(
    _.values(FILTER_CATEGORIES),
    (it) => it.urlParam === key
  );
  const title = _.capitalize(filterCategory.title);
  const label = _.find(filterCategory.values, (it) => it.value === value).label
    .props.children;
  return [title, label];
}

function hasChip(name, value) {
  cy.contains(CHIP_GROUP, name).parent().contains(CHIP, value);
}

/**
 * filter data given a set of filter values and their configuration
 * @param {@filtersConf} conf - Configuration of the filters
 * @param {Array} data - Values to be filtered
 * @param {Object} filters - Applied filters and their values
 * @returns
 */
function filter(conf, data, filters) {
  let filteredData = data;
  for (const [key, value] of Object.entries(filters)) {
    filteredData = _.filter(filteredData, (it) =>
      conf[key].filterFunc(it, value)
    );
    // if length is already 0, exit
    if (filteredData.length === 0) {
      break;
    }
  }
  return filteredData;
}

export { applyFilters, urlParamConvert, hasChip, filter };
