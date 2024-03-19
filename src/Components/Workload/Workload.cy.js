import React from 'react';
import mockdata from '../../../cypress/fixtures/api/insights-results-aggregator/v2/workload/00000001-0001-0001-0001-000000000005-fad82c1f-96db-430f-b3ec-503fb9eeb7bb/info.json';
import mockList from '../../../cypress/fixtures/api/insights-results-aggregator/v2/workload/list.json';
import _ from 'lodash';
import { featureFlagsInterceptors } from '../../../cypress/utils/interceptors';
import { Workload } from './Workload';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import getStore from '../../Store';
import { checkRowCounts, checkSorting } from '../../../cypress/utils/table';
import { SORTING_ORDERS } from '../../../cypress/utils/globals';
import { WORKLOAD_RULES_COLUMNS } from '../../AppConstants';
// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  applyFilters,
  checkEmptyState,
} from '@redhat-cloud-services/frontend-components-utilities';

const BREADCRUMBS = 'nav[class=pf-v5-c-breadcrumb]';
const WORKLOAD_HEADER = '#workload-header';
const WORKLOAD_RULES_TABLE = '#workload-recs-list-table';
const FILTER_CHIPS = 'li[class=pf-v5-c-chip-group__list-item]';
const WORKLOAD_NAME =
  'Advisor workloadsCluster name 00000001-0001-0001-0001-000000000001 | Namespace name 7eb1d18b-701b-4f51-aea0-5f235daf1e07';
const TABLE_HEADERS = _.map(WORKLOAD_RULES_COLUMNS, (it) => it.title);
const SEARCH_ITEMS_DESCRIPTION = ['ff', 'CUSTOM', 'Foobar'];
const SEARCH_ITEMS_OBJECTS = [
  'ff',
  'CUSTOM',
  '4381b689-02eb-465a-90cf-55b3e2305d8d',
];
const namespaceId = '7eb1d18b-701b-4f51-aea0-5f235daf1e07';
const clusterId = '00000001-0001-0001-0001-000000000001';
const uuid = `${clusterId}/${namespaceId}`;
let workload = {
  isError: false,
  isFetching: true,
  isUninitialized: true,
  isLoading: true,
  isSuccess: false,
  data: {},
  refetch: () => null,
};

const filtersConf = {
  description: {
    selectorText: 'Description',
    values: SEARCH_ITEMS_DESCRIPTION,
    type: 'input',
    filterFunc: (it, value) =>
      it.details.toLowerCase().includes(value.toLowerCase()),
  },
  objects_id: {
    selectorText: 'Objects ID',
    values: SEARCH_ITEMS_OBJECTS,
    type: 'input',
    filterFunc: (it, value) =>
      it.objects.some((obj) =>
        obj.uid.toLowerCase().includes(value.toLowerCase())
      ),
  },
  total_risk: {
    selectorText: 'Total risk',
    values: SEARCH_ITEMS_OBJECTS,
    type: 'checkbox',
    filterFunc: (it, value) => value.includes(String(it.total_risk)),
  },
};

// eslint-disable-next-line no-unused-vars
const filterApply = (filters) => applyFilters(filters, filtersConf);

if (mockList.includes(uuid)) {
  const customData = {
    ...mockdata,
    cluster: {
      display_name: `Cluster name ${clusterId}`,
      uuid: clusterId,
    },
    namespace: {
      name: `Namespace name ${namespaceId}`,
      uuid: namespaceId,
    },
  };
  workload = {
    isError: false,
    isFetching: false,
    isUninitialized: false,
    isLoading: false,
    isSuccess: true,
    data: { ...customData },
    refetch: () => null,
  };
} else {
  workload = {
    isError: true,
    isFetching: false,
    isUninitialized: false,
    isLoading: false,
    isSuccess: false,
    data: { status: 'error' },
    refetch: () => null,
  };
}

const mount = (
  url = '/openshift/insights/advisor/workloads/clustername/namespacename'
) => {
  cy.mount(
    <MemoryRouter initialEntries={[url]} initialIndex={0}>
      <IntlProvider locale="en">
        <Provider store={getStore()}>
          <Workload
            workload={workload}
            namespaceId={namespaceId}
            clusterId={clusterId}
          />
        </Provider>
      </IntlProvider>
    </MemoryRouter>
  );
};

describe('workloads list "No workload recommendations" Empty state rendering', () => {
  beforeEach(() => {
    featureFlagsInterceptors.ocpWorkloadsSuccessful();
  });

  it('renders main components', () => {
    mount();
    cy.get(BREADCRUMBS)
      .should('have.length', 1)
      .should('have.text', WORKLOAD_NAME);
    cy.get(WORKLOAD_HEADER).should('have.length', 1);
    // renders table component
    cy.get(WORKLOAD_RULES_TABLE).should('have.length', 1);
    // test how many rows were rendered
    //the value of rows is x2 because they are expandable
    checkRowCounts(mockdata.recommendations.length * 2, true);
  });

  it('adds additional filters passed by the query parameters, 1', () => {
    mount(
      '/openshift/insights/advisor/workloads/clustername/namespacename?description=name&total_risk=4'
    );

    cy.get(BREADCRUMBS).should('have.length', 1);
    cy.get(WORKLOAD_HEADER).should('have.length', 1);
    cy.get(WORKLOAD_RULES_TABLE);
    cy.get(FILTER_CHIPS).each(($el) =>
      expect($el.text()).to.be.oneOf([
        'name',
        'Description',
        'Total risk',
        'Critical',
      ])
    );
    checkEmptyState('No matching recommendations found');
  });

  it('adds additional filters passed by the query parameters, 2', () => {
    mount(
      '/openshift/insights/advisor/workloads/clustername/namespacename?description=foobar'
    );

    cy.get(BREADCRUMBS).should('have.length', 1);
    cy.get(WORKLOAD_HEADER).should('have.length', 1);
    cy.get(WORKLOAD_RULES_TABLE);
    cy.get(FILTER_CHIPS).each(($el) =>
      expect($el.text()).to.be.oneOf(['foobar', 'description'])
    );
  });

  it('adds additional filters passed by the query parameters, 3', () => {
    mount(
      '/openshift/insights/advisor/workloads/clustername/namespacename?total_risk=2'
    );

    cy.get(BREADCRUMBS).should('have.length', 1);
    cy.get(WORKLOAD_HEADER).should('have.length', 1);
    cy.get(WORKLOAD_RULES_TABLE);
    cy.get(FILTER_CHIPS).each(($el) =>
      expect($el.text()).to.be.oneOf(['Total risk', 'Moderate'])
    );
  });

  it('adds additional filters passed by the query parameters, 4', () => {
    mount(
      '/openshift/insights/advisor/workloads/clustername/namespacename?object_id=bb78507b-cc1c-4c53-af2c-7807d9cbeab4'
    );

    cy.get(BREADCRUMBS).should('have.length', 1);
    cy.get(WORKLOAD_HEADER).should('have.length', 1);
    cy.get(WORKLOAD_RULES_TABLE);
    cy.get(FILTER_CHIPS).each(($el) =>
      expect($el.text()).to.be.oneOf([
        'Object ID',
        'bb78507b-cc1c-4c53-af2c-7807d9cbeab4',
      ])
    );
  });

  it('Setting text filter', () => {
    mount();
    cy.get('div.ins-c-primary-toolbar__filter')
      .find('button[aria-label="Conditional filter"]')
      .click();
    cy.get('li[data-ouia-component-type="PF5/DropdownItem"]')
      .contains('Description')
      .click();
    cy.get('input[data-ouia-component-type="PF5/TextInput"]').type('Foobar');
  });

  it('Setting objects filter', () => {
    mount();
    cy.get('div.ins-c-primary-toolbar__filter')
      .find('button[aria-label="Conditional filter"]')
      .click();
    cy.get('li[data-ouia-component-type="PF5/DropdownItem"]')
      .contains('Object ID')
      .click();
    cy.get('input[data-ouia-component-type="PF5/TextInput"]').type(
      '4381b689-02eb-465a-90cf-55b3e2305d8d'
    );
  });

  it('Setting critical severity filter', () => {
    mount();
    cy.get('div.ins-c-primary-toolbar__filter')
      .find('button[aria-label="Conditional filter"]')
      .click();
    cy.get('li[data-ouia-component-type="PF5/DropdownItem"]')
      .contains('Total risk')
      .click();
    cy.get('button[aria-label="Options menu"]').click();
    cy.get('div[data-ouia-component-type="PF5/Select"]')
      .find('label')
      .contains('Critical')
      .parent()
      .find('input[type=checkbox]')
      .check();
  });
});

describe('header rendered correct', () => {
  it('last breadcrumb', () => {
    mount();

    cy.get(BREADCRUMBS)
      .should('have.length', 1)
      .get('.pf-v5-c-breadcrumb__list > :nth-child(2)')
      .should(
        'have.text',
        'Cluster name 00000001-0001-0001-0001-000000000001 | Namespace name 7eb1d18b-701b-4f51-aea0-5f235daf1e07'
      );
  });

  it('title', () => {
    mount(`/openshift/insights/advisor/workloads/${clusterId}/${namespaceId}`);
    cy.get('#workloads-header-title').should(
      'have.text',
      'Cluster name 00000001-0001-0001-0001-000000000001Namespace name 7eb1d18b-701b-4f51-aea0-5f235daf1e07'
    );
  });

  it('cluster id and namespace id', () => {
    mount(`/openshift/insights/advisor/workloads/${clusterId}/${namespaceId}`);
    cy.get('#workload-header-uuid').should(
      'have.text',
      'Cluster UUID: 00000001-0001-0001-0001-000000000001 Namespace UUID: 7eb1d18b-701b-4f51-aea0-5f235daf1e07'
    );
  });

  it('last seen values', () => {
    mount(`/openshift/insights/advisor/workloads/${clusterId}/${namespaceId}`);
    cy.get('#workload-header-last-seen').should(
      'have.text',
      'Last seen: 23 Jan 2024 11:57 UTC'
    );
  });
});

describe('sorting', () => {
  // all tables must preserve original ordering
  _.zip(
    ['description', 'total_risk', 'objects', 'modified'],
    TABLE_HEADERS
  ).forEach(([category, label]) => {
    SORTING_ORDERS.forEach((order) => {
      it(`${order} by ${label}`, () => {
        mount();
        let sortingParameter = category;
        if (category === 'description') {
          sortingParameter = (it) => it.details;
        } else if (category === 'total_risk') {
          sortingParameter = (it) => it.total_risk;
        } else if (category === 'objects') {
          sortingParameter = (it) => it.objects.length;
        } else if (category === 'modified') {
          sortingParameter = (it) => it.modified;
        }

        checkSorting(
          mockdata.recommendations,
          sortingParameter,
          label,
          order,
          'Description',
          'details',
          5,
          null
        );
      });
    });
  });
});
