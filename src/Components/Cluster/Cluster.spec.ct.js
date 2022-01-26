import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router';

import { Intl } from '../../Utilities/intlHelper';
import { Cluster } from './Cluster';
import { Provider } from 'react-redux';
import getStore from '../../Store';
import '@patternfly/patternfly/patternfly.scss';

describe('cluster page', () => {
  // selectors
  const CLUSTER_HEADER = '#cluster-header';
  const BREADCRUMBS = 'nav[class=pf-c-breadcrumb]';
  const RULES_TABLE = '#cluster-recs-list-table';
  let props;

  beforeEach(() => {
    props = {
      cluster: {
        isError: false,
        isUninitialized: false,
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        data: {},
      },
      displayName: {
        data: 'display-name-123',
      },
      match: {
        params: {
          clusterId: 'foobar',
        },
        url: 'foobar',
      },
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
      .should('have.text', 'display-name-123');
    // renders cluster header
    cy.get(CLUSTER_HEADER).should('have.length', 1);
    // renders table component
    cy.get(RULES_TABLE).should('have.length', 1);
  });
  it('cluster page in the loading state', () => {
    props = {
      ...props,
      cluster: {
        ...props.cluster,
        isLoading: true,
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
    // does not render table component
    cy.get(RULES_TABLE).should('have.length', 0);
    cy.get('#loading-skeleton').should('have.length', 1);
  });
  it('cluster page in the error state', () => {
    props = {
      ...props,
      cluster: {
        ...props.cluster,
        isError: true,
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
    // does not render table component
    cy.get(RULES_TABLE).should('have.length', 0);
    cy.get('.pf-c-empty-state').should('have.length', 1);
  });
});
