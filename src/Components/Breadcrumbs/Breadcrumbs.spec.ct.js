import React from 'react';
import { mount } from '@cypress/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';

import Breadcrumbs from './';

describe('breadcrumbs', () => {
  const BREADCRUMB_ITEM = '.breadcrumb-item';
  let props;

  it('renders breadcrumbs: single rec page', () => {
    props = {
      current: 'Cluster upgrade will fail when default SCC gets changed',
    };
    mount(
      <MemoryRouter
        initialEntries={['/recommendations/ccxdev.external.123|ERROR_KEY']}
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
      .should('have.attr', 'href', '/recommendations');
    cy.get(BREADCRUMB_ITEM)
      .eq(1)
      .should(
        'have.text',
        'Cluster upgrade will fail when default SCC gets changed'
      );
    cy.get(BREADCRUMB_ITEM).eq(1).find('span').should('have.length', 1);
  });

  it('renders breadcrumbs: single cluster page', () => {
    props = {
      current: 'Cluster with issues',
    };
    mount(
      <MemoryRouter
        initialEntries={['/clusters/d6964a24-a78c-4bdc-8100-17e797efe3d3']}
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
      .should('have.attr', 'href', '/clusters');
    cy.get(BREADCRUMB_ITEM).eq(1).should('have.text', 'Cluster with issues');
    cy.get(BREADCRUMB_ITEM).eq(1).find('span').should('have.length', 1);
  });
});
