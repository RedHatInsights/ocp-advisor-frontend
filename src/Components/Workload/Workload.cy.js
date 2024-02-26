import React from 'react';
import mockdata from '../../../cypress/fixtures/api/insights-results-aggregator/v2/workload/00000001-0001-0001-0001-000000000005-fad82c1f-96db-430f-b3ec-503fb9eeb7bb/info.json';
import mockList from '../../../cypress/fixtures/api/insights-results-aggregator/v2/workload/list.json';
import { featureFlagsInterceptors } from '../../../cypress/utils/interceptors';
import { Workload } from './Workload';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import getStore from '../../Store';
import {
  checkNoMatchingRecs,
  checkRowCounts,
} from '../../../cypress/utils/table';

const BREADCRUMBS = 'nav[class=pf-v5-c-breadcrumb]';
const WORKLOAD_HEADER = '#workload-header';
const WORKLOAD_RULES_TABLE = '#workload-recs-list-table';
const FILTER_CHIPS = 'li[class=pf-v5-c-chip-group__list-item]';
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

function tempCheckEmptyState(title, checkIcon = false) {
  checkRowCounts(0);
  cy.get('table')
    .ouiaId('empty-state')
    .should('have.length', 1)
    .within(() => {
      cy.get('.pf-c-empty-state__icon').should(
        'have.length',
        checkIcon ? 1 : 0
      );
      cy.get(`h5[class="pf-v5-c-empty-state__title-text"]`).should(
        'have.text',
        title
      );
    });
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
      .should(
        'have.text',
        'Advisor workloadsCluster name 00000001-0001-0001-0001-000000000001 | Namespace name 7eb1d18b-701b-4f51-aea0-5f235daf1e07'
      );
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
    tempCheckEmptyState('No matching recommendations found');
  });
});


