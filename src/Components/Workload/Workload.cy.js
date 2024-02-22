import React from 'react';
import mockdata from '../../../cypress/fixtures/api/insights-results-aggregator/v2/workload/00000001-0001-0001-0001-000000000005-fad82c1f-96db-430f-b3ec-503fb9eeb7bb/info.json';
import mockList from '../../../cypress/fixtures/api/insights-results-aggregator/v2/workload/list.json';
import { featureFlagsInterceptors } from '../../../cypress/utils/interceptors';
import { Workload } from './Workload';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import getStore from '../../Store';

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

const mount = () => {
  cy.mount(
    <MemoryRouter
      initialEntries={[
        '/openshift/insights/advisor/workloads/clustername/namespacename',
      ]}
      initialIndex={0}
    >
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

  it('has more entries than default pagination', () => {
    mount();
    cy.get('[data-ouia-component-type="PF5/Breadcrumb"]')
      .should('have.length', 1)
      .should(
        'have.text',
        'Advisor workloadsCluster name 00000001-0001-0001-0001-000000000001 | Namespace name 7eb1d18b-701b-4f51-aea0-5f235daf1e07'
      );
  });
});
