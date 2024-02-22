import React from 'react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';

import Breadcrumbs from './';

describe('breadcrumbs', () => {
  const BREADCRUMB_ITEM = '.breadcrumb-item';
  let props;

  it('renders breadcrumbs: single rec page', () => {
    props = {
      current: 'Cluster update will fail when default SCC gets changed',
    };
    cy.cy.mount(
      <MemoryRouter
        initialEntries={[
          '/openshift/insights/advisor/recommendations/ccxdev.external.123|ERROR_KEY',
        ]}
        initialIndex={0}
      >
        <IntlProvider locale="en">
          <Breadcrumbs {...props} />
        </IntlProvider>
      </MemoryRouter>
    );
    cy.get(BREADCRUMB_ITEM).should('have.length', 2);
    cy.get(BREADCRUMB_ITEM)
      .eq(0)
      .should('have.text', 'Advisor recommendations');
    cy.get(BREADCRUMB_ITEM)
      .eq(0)
      .find('a')
      .should(
        'have.attr',
        'href',
        '/openshift/insights/advisor/recommendations'
      );
    cy.get(BREADCRUMB_ITEM)
      .eq(1)
      .should(
        'have.text',
        'Cluster update will fail when default SCC gets changed'
      );
    cy.get(BREADCRUMB_ITEM).eq(1).find('span').should('have.length', 1);
  });

  it('renders breadcrumbs: single cluster page', () => {
    props = {
      current: 'Cluster with issues',
    };
    cy.mount(
      <MemoryRouter
        initialEntries={[
          '/openshift/insights/advisor/clusters/d6964a24-a78c-4bdc-8100-17e797efe3d3',
        ]}
        initialIndex={0}
      >
        <IntlProvider locale="en">
          <Breadcrumbs {...props} />
        </IntlProvider>
      </MemoryRouter>
    );
    cy.get(BREADCRUMB_ITEM).should('have.length', 2);
    cy.get(BREADCRUMB_ITEM).eq(0).should('have.text', 'Advisor clusters');
    cy.get(BREADCRUMB_ITEM)
      .eq(0)
      .find('a')
      .should('have.attr', 'href', '/openshift/insights/advisor/clusters');
    cy.get(BREADCRUMB_ITEM).eq(1).should('have.text', 'Cluster with issues');
    cy.get(BREADCRUMB_ITEM).eq(1).find('span').should('have.length', 1);
  });

  it('renders breadcrumbs: single workloads details page', () => {
    props = {
      current: 'Cluster name 000000001 | Namespace name c1-94f525441c75',
      workloads: true,
    };
    cy.mount(
      <MemoryRouter
        initialEntries={[
          '/openshift/insights/advisor/workloads/000000001/c1-94f525441c75?sort=-description',
        ]}
        initialIndex={0}
      >
        <IntlProvider locale="en">
          <Breadcrumbs {...props} />
        </IntlProvider>
      </MemoryRouter>
    );
    cy.get(BREADCRUMB_ITEM).should('have.length', 2);
    cy.get(BREADCRUMB_ITEM).eq(0).should('have.text', 'Advisor workloads');
    cy.get(BREADCRUMB_ITEM)
      .eq(0)
      .find('a')
      .should('have.attr', 'href', '/openshift/insights/advisor/workloads');
    cy.get(BREADCRUMB_ITEM)
      .eq(1)
      .should(
        'have.text',
        'Cluster name 000000001 | Namespace name c1-94f525441c75'
      );
    cy.get(BREADCRUMB_ITEM).eq(1).find('span').should('have.length', 1);
  });
});
