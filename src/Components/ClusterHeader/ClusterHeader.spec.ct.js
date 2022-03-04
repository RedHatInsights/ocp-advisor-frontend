import React from 'react';
import { mount } from '@cypress/react';

import { Intl } from '../../Utilities/intlHelper';
import { ClusterHeader } from './ClusterHeader';
import '@patternfly/patternfly/patternfly.scss';

// selectors
const HEADER_TITLE = '#cluster-header-title';
const UUID_FIELD = '#cluster-header-uuid > :nth-child(2)';
const LAST_SEEN_FIELD = '#cluster-header-last-seen > :nth-child(2)';

describe('cluster page header', () => {
  let props;

  //FIXME where is clusterId computed?
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
              cluster_name: 'Cluster with issues',
            },
          },
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
      displayName: {
        ...props.displayName,
        isFetching: true,
        data: undefined,
      },
    };
    mount(
      <Intl>
        <ClusterHeader {...props} />
      </Intl>
    );
    // check title
    cy.get(HEADER_TITLE).should('have.length', 1);
    cy.get('.ins-c-skeleton').should('have.length', 0);
    // check uuid text
    cy.get(UUID_FIELD).should('have.text', 'foobar');
    // check uuid text
    cy.get(LAST_SEEN_FIELD).should('have.text', '24 Jul 2021 14:22 UTC');
  });
  // this test is not checking UUID but name
  it('show UUID when display name is unavailable', () => {
    props.clusterData.data.report.meta.cluster_name = undefined;
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
});
