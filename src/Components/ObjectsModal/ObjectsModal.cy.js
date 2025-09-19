import React from 'react';
import ObjectsModal from './ObjectsModal';
import getStore from '../../Store';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import mockObjects from '../../../cypress/fixtures/api/insights-results-aggregator/objects.json';
import objectsWithNames from '../../../cypress/fixtures/api/insights-results-aggregator/objectsWithNames.json';
import _ from 'lodash';
import {
  MENU_TOGGLE,
  PAGINATION,
  PAGINATION_NEXT,
  PAGINATION_VALUES,
  TOOLBAR,
  checkPaginationValues,
  checkRowCounts,
} from '@redhat-cloud-services/frontend-components-utilities';
import {
  changePagination,
  checkPaginationTotal,
  itemsPerPage,
} from '../../../cypress/utils/pagination';

const mount = (url, objects, objectsWithNames) => {
  cy.mount(
    <MemoryRouter initialEntries={[url]} initialIndex={0}>
      <IntlProvider locale="en">
        <Provider store={getStore()}>
          <ObjectsModal
            isModalOpen={true}
            objects={objects}
            objectsWithNames={objectsWithNames}
          />
        </Provider>
      </IntlProvider>
    </MemoryRouter>
  );
};

const FILTER_CHIPS = 'li[class=pf-v6-c-label-group__list-item]';
const DEFAULT_ROW_COUNT = 50;
const DEFAULT_DISPLAYED_SIZE = Math.min(mockObjects.length, DEFAULT_ROW_COUNT);
let values = _.cloneDeep(mockObjects);
const data = _.orderBy(values, [(it) => it.uid], ['desc']);

describe('Objects modal renders and filters data', () => {
  it('renders main components', () => {
    mount(
      '/openshift/insights/advisor/workloads/clustername/namespacename',
      mockObjects,
      false
    );
    // renders table component
    cy.get('#objects-list-table').should('have.length', 1);
    // test how many rows were rendered
    checkRowCounts(DEFAULT_DISPLAYED_SIZE, true);
  });

  it('renders empty state', () => {
    mount(
      '/openshift/insights/advisor/workloads/clustername/namespacename',
      [],
      false
    );
    cy.get('#objects-list-table')
      .ouiaId('empty-state')
      .should('have.length', 1);
    cy.get(`h5[class="pf-v6-c-empty-state__title-text"]`).should(
      'have.text',
      'No matching workloads found'
    );
  });

  it('Adds filters and produces chips correctly', () => {
    mount(
      '/openshift/insights/advisor/workloads/clustername/namespacename',
      mockObjects,
      false
    );
    cy.get('#objects-list-table');
    cy.get('input[data-ouia-component-id="ConditionalFilter"]').type('foobar', {
      force: true,
    });
    cy.get(FILTER_CHIPS).each(($el) =>
      expect($el.text()).to.be.oneOf(['Object id', 'foobar'])
    );
    checkRowCounts(1, true);
  });

  it('Adds filters and produces empty state with no results', () => {
    mount(
      '/openshift/insights/advisor/workloads/clustername/namespacename',
      mockObjects,
      false
    );
    cy.get('#objects-list-table');
    cy.get('input[data-ouia-component-type="PF6/TextInput"]').type(
      'wrong filter',
      {
        force: true,
      }
    );
    cy.get(FILTER_CHIPS).each(($el) =>
      expect($el.text()).to.be.oneOf(['Object id', 'wrong filter'])
    );
    cy.get(`h5[class="pf-v6-c-empty-state__title-text"]`).should(
      'have.text',
      'No matching workloads found'
    );
  });
});

describe('Pagination', () => {
  it('shows correct total number of objects', () => {
    mount(
      '/openshift/insights/advisor/workloads/clustername/namespacename',
      mockObjects,
      false
    );
    checkPaginationTotal(mockObjects.length);
  });

  it(`is set to ${DEFAULT_ROW_COUNT}`, () => {
    mount(
      '/openshift/insights/advisor/workloads/clustername/namespacename',
      mockObjects,
      false
    );
    cy.get(MENU_TOGGLE)
      .get('.pf-m-text')
      .find('b')
      .eq(0)
      .should('have.text', `1 - ${DEFAULT_DISPLAYED_SIZE}`);
  });

  it('values are expected ones', () => {
    mount(
      '/openshift/insights/advisor/workloads/clustername/namespacename',
      mockObjects,
      false
    );
    checkPaginationValues(PAGINATION_VALUES);
  });

  it('can change page limit', () => {
    mount(
      '/openshift/insights/advisor/workloads/clustername/namespacename',
      mockObjects,
      false
    );
    cy.wrap(PAGINATION_VALUES).each((el) => {
      changePagination(el).then(() => {
        checkRowCounts(Math.min(el, mockObjects.length));
      });
    });
  });

  it('can iterate over pages', () => {
    mount(
      '/openshift/insights/advisor/workloads/clustername/namespacename',
      mockObjects,
      false
    );
    cy.wrap(itemsPerPage(data.length)).each((el, index, list) => {
      checkRowCounts(el);
      cy.get(TOOLBAR)
        .find(PAGINATION)
        .find(PAGINATION_NEXT)
        .then(($button) => {
          if (index === list.length - 1) {
            cy.wrap($button).should('be.disabled');
          } else {
            cy.wrap($button).click();
          }
        });
    });
  });
});

describe('Objects modal with names', () => {
  it('renders main components', () => {
    mount(
      '/openshift/insights/advisor/workloads/clustername/namespacename',
      objectsWithNames,
      true
    );
    // renders table component
    cy.get('#objects-list-table').should('have.length', 1);
    // test how many rows were rendered
    checkRowCounts(DEFAULT_DISPLAYED_SIZE, true);
  });

  it('renders empty state', () => {
    mount(
      '/openshift/insights/advisor/workloads/clustername/namespacename',
      [],
      true
    );
    cy.get('#objects-list-table')
      .ouiaId('empty-state')
      .should('have.length', 1);
    cy.get(`h5[class="pf-v6-c-empty-state__title-text"]`).should(
      'have.text',
      'No matching workloads found'
    );
  });

  it('Adds filters and produces chips correctly', () => {
    mount(
      '/openshift/insights/advisor/workloads/clustername/namespacename',
      objectsWithNames,
      true
    );
    cy.get('#objects-list-table');
    cy.get('input[data-ouia-component-id="ConditionalFilter"]').type(
      'display name',
      {
        force: true,
      }
    );
    cy.get(FILTER_CHIPS).each(($el) =>
      expect($el.text()).to.be.oneOf(['Name', 'display name'])
    );
    checkRowCounts(1, true);
  });

  it('Adds filters and produces empty state with no results', () => {
    mount(
      '/openshift/insights/advisor/workloads/clustername/namespacename',
      objectsWithNames,
      true
    );
    cy.get('#objects-list-table');
    cy.get('input[data-ouia-component-id="ConditionalFilter"]').type(
      'wrong filter',
      {
        force: true,
      }
    );
    cy.get(FILTER_CHIPS).each(($el) =>
      expect($el.text()).to.be.oneOf(['Object id', 'wrong filter'])
    );
    cy.get(`h5[class="pf-v6-c-empty-state__title-text"]`).should(
      'have.text',
      'No matching workloads found'
    );
  });
});
