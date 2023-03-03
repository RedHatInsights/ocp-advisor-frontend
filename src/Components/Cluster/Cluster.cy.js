import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';

import { Intl } from '../../Utilities/intlHelper';
import { Cluster } from './Cluster';
import { Provider } from 'react-redux';
import getStore from '../../Store';
import singleClusterPageReport from '../../../cypress/fixtures/api/insights-results-aggregator/v2/cluster/dcb95bbf-8673-4f3a-a63c-12d4a530aa6f/reports-disabled-false.json';
import {
  checkNoMatchingRecs,
  checkRowCounts,
} from '../../../cypress/utils/table';

// selectors
const CLUSTER_HEADER = '#cluster-header';
const BREADCRUMBS = 'nav[class=pf-c-breadcrumb]';
const RULES_TABLE = '#cluster-recs-list-table';
const FILTER_CHIPS = 'li[class=pf-c-chip-group__list-item]';
let props;

describe('cluster page', () => {
  beforeEach(() => {
    // the flag tells not to fetch external federated modules
    window.CYPRESS_RUN = true;

    props = {
      cluster: {
        isError: false,
        isUninitialized: false,
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        data: singleClusterPageReport,
      },
      displayName: {
        data: singleClusterPageReport.report.meta.cluster_name,
      },
      clusterId: 'foobar',
    };
  });

  it('cluster page in the successful state', () => {
    mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <Cluster {...props} />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
    // renders breadcrumbs
    cy.get(BREADCRUMBS)
      .should('have.length', 1)
      .get('.pf-c-breadcrumb__list > :nth-child(2)')
      .should('have.text', 'Cluster With Issues');
    // renders cluster header
    cy.get(CLUSTER_HEADER).should('have.length', 1);
    // renders table component
    cy.get(RULES_TABLE).should('have.length', 1);
    // test how many rows were rendered
    checkRowCounts(singleClusterPageReport.report.data.length, true);
  });

  it('cluster page in the loading state', () => {
    props = {
      ...props,
      cluster: {
        ...props.cluster,
        isFetching: true,
        isSuccess: false,
        data: undefined,
      },
    };
    mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <Cluster {...props} />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
    // renders breadcrumbs
    cy.get(BREADCRUMBS).should('have.length', 1);
    // renders cluster header
    cy.get(CLUSTER_HEADER).should('have.length', 1);
    // renders table component
    cy.get(RULES_TABLE).should('have.length', 1);
    cy.ouiaId('loading-skeleton').should('have.length', 1);
  });

  it('cluster page in the error state', () => {
    props = {
      ...props,
      cluster: {
        ...props.cluster,
        isError: true,
        isSuccess: false,
        isFetching: false,
        data: undefined,
      },
    };
    mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <Cluster {...props} />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
    // renders breadcrumbs
    cy.get(BREADCRUMBS).should('have.length', 1);
    // renders cluster header
    cy.get(CLUSTER_HEADER).should('have.length', 1);
    // renders table component
    cy.get(RULES_TABLE).should('have.length', 1);
    cy.get('.pf-c-empty-state').should('have.length', 1);
  });

  it('adds additional filters passed by the query parameters №1', () => {
    mount(
      <MemoryRouter initialEntries={['?total_risk=1&text=foo+bar&category=2']}>
        <Intl>
          <Provider store={getStore()}>
            <Cluster {...props} />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
    cy.get(BREADCRUMBS);
    cy.get(CLUSTER_HEADER);
    cy.get(RULES_TABLE);
    cy.get(FILTER_CHIPS).each(($el) =>
      expect($el.text()).to.be.oneOf(['foo bar', 'Low', 'Performance'])
    );
    checkNoMatchingRecs();
  });

  it('adds additional filters passed by the query parameters №2', () => {
    mount(
      <MemoryRouter initialEntries={['?total_risk=2&text=foo&category=1']}>
        <Intl>
          <Provider store={getStore()}>
            <Cluster {...props} />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
    cy.get(BREADCRUMBS);
    cy.get(CLUSTER_HEADER);
    cy.get(RULES_TABLE);
    cy.get(FILTER_CHIPS).each(($el) =>
      expect($el.text()).to.be.oneOf([
        'foo',
        'Moderate',
        'Service Availability',
      ])
    );
    checkNoMatchingRecs();
  });
});

describe('Cluster page display name test №1', () => {
  before(() => {
    props = {
      cluster: {
        isError: false,
        isUninitialized: false,
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        data: singleClusterPageReport,
      },
      clusterId: 'Cluster Id',
    };
  });

  it('Cluster breadcrumbs name should be Cluster With Issues', () => {
    mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <Cluster {...props} />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
    cy.get(BREADCRUMBS)
      .should('have.length', 1)
      .get('.pf-c-breadcrumb__list > :nth-child(2)')
      .should('have.text', 'Cluster With Issues');
  });

  it('Cluster breadcrumbs name should be = Cluster Id', () => {
    mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <Cluster
              {...{ ...props, cluster: { ...props.cluster, data: null } }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
    cy.get(BREADCRUMBS)
      .should('have.length', 1)
      .get('.pf-c-breadcrumb__list > :nth-child(2)')
      .should('have.text', 'Cluster Id');
  });
});
