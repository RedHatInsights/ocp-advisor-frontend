import React from 'react';
import { mount } from '@cypress/react';

import { Intl } from '../../Utilities/intlHelper';
import { ClusterHeader } from './ClusterHeader';

// selectors
const HEADER_TITLE = '#cluster-header-title';
const UUID_FIELD = '#cluster-header-uuid > :nth-child(2)';
const LAST_SEEN_FIELD = '#cluster-header-last-seen > :nth-child(2)';

describe('cluster page header', () => {
  let props;

  beforeEach(() => {
    props = {
      clusterId: 'foobar',
      clusterData: {
        isUninitialized: false,
        isFetching: false,
        data: {
          report: {
            meta: {
              last_checked_at: '2021-07-24T14:22:36.109Z',
            },
          },
        },
      },
      clusterInfo: {
        isUninitialized: false,
        isFetching: false,
        data: {
          display_name: 'Cluster with issues',
        },
      },
    };
  });
  it('cluster page header with the display name available', () => {
    mount(
      <Intl>
        <ClusterHeader {...props} />
      </Intl>
    );
    // check title
    cy.get(HEADER_TITLE).should('have.text', 'Cluster with issues');
    // check uuid text
    cy.get(UUID_FIELD).should('have.text', 'foobar');
    // check last seen text
    cy.get(LAST_SEEN_FIELD).should('have.text', '24 Jul 2021 14:22 UTC');
  });
  it('show skeleton when in the loading state', () => {
    props = {
      ...props,
      clusterInfo: {
        isUninitialized: false,
        isFetching: true,
        data: null,
      },
    };
    mount(
      <Intl>
        <ClusterHeader {...props} />
      </Intl>
    );
    // check title
    cy.get(HEADER_TITLE).should('have.length', 1);
    cy.get('.ins-c-skeleton').should('have.length', 1);
    // check uuid text
    cy.get(UUID_FIELD).should('have.text', 'foobar');
    // check uuid text
    cy.get(LAST_SEEN_FIELD).should('have.text', '24 Jul 2021 14:22 UTC');
  });
  // this test is not checking UUID but name
  it('show UUID when display name is unavailable', () => {
    props.clusterInfo.data.display_name = undefined;
    mount(
      <Intl>
        <ClusterHeader {...props} />
      </Intl>
    );
    // check title
    cy.get(HEADER_TITLE).should('have.text', 'foobar');
    // check uuid text
    cy.get(UUID_FIELD).should('have.text', 'foobar');
  });

  it('action redirect button works', () => {
    mount(
      <Intl>
        <ClusterHeader {...props} />
      </Intl>
    );
    cy.get('.pf-c-dropdown__toggle').click();
    cy.get('a[class=pf-c-dropdown__menu-item]').click();
    cy.url().should('include', 'openshift/details/' + props.clusterId);
  });
});
