import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { Intl } from '../../Utilities/intlHelper';
import getStore from '../../Store';
import { ClustersListTable } from './ClustersListTable';
import props from '../../../cypress/fixtures/ClustersListTable/data.json';

describe('clusters list table', () => {
  const CLUSTERS_LIST_TABLE = 'div[id=clusters-list-table]';
  const TBODY = 'tbody[role=rowgroup]';
  const CHIP_GROUP = '.pf-c-chip-group__main';
  const TOOLBAR_FILTER = '.ins-c-primary-toolbar__filter';
  const PAGINATION = '.pf-c-pagination';

  Cypress.Commands.add('getTotalClusters', () =>
    cy.get('.pf-c-options-menu__toggle-text').find('b').eq(1)
  );
  Cypress.Commands.add('getFirstRow', () => cy.get(TBODY).children().eq(0));

  beforeEach(() => {
    mount(
      <MemoryRouter initialEntries={['/clusters']} initialIndex={0}>
        <Intl>
          <Provider store={getStore()}>
            <ClustersListTable
              query={{
                isError: false,
                isFetching: false,
                isUninitialized: false,
                isSuccess: true,
                data: props,
              }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('renders table', () => {
    cy.get(CLUSTERS_LIST_TABLE).should('have.length', 1);
  });

  it('shows 28 clusters as a total number', () => {
    cy.getTotalClusters().should('have.text', 28);
  });

  it('pagination default is set to 20', () => {
    cy.get(TBODY).children().should('have.length', 20);
    cy.get('.pf-c-options-menu__toggle-text')
      .find('b')
      .eq(0)
      .should('have.text', '1 - 20');
  });

  it('applies one total risk filter as a default', () => {
    cy.get(CHIP_GROUP)
      .find('.pf-c-chip-group__label')
      .should('have.text', 'Total Risk');
    cy.get(CHIP_GROUP)
      .find('.pf-c-chip__text')
      .should('have.length', 1)
      .should('have.text', 'All clusters');
  });

  it('can filter out only hitting clusters', () => {
    // initially there are 28 clusters
    cy.getTotalClusters().should('have.text', 28);
    // open filter toolbar
    cy.get('.ins-c-primary-toolbar__filter button').click();
    //change the filter toolbar item
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-dropdown__menu')
      .find('li')
      .eq(1)
      .click({ force: true });
    cy.get(TOOLBAR_FILTER).find('.pf-c-select__toggle').click();
    // remove "All clusters" filter value
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-select__menu')
      .find('input')
      .eq(0)
      .click({ force: true });
    // open pagination
    cy.get(PAGINATION)
      .eq(0)
      .find('.pf-c-options-menu__toggle-button')
      .click({ force: true });
    // set to 50 clusters per page
    cy.get(PAGINATION)
      .eq(0)
      .find('.pf-c-options-menu')
      .find('li')
      .eq(2)
      .find('button')
      .click({ force: true });
    cy.getTotalClusters().should('have.text', 25);
    // check all shown clusters have recommendations > 0
    cy.get('TBODY')
      .find('td[data-label=Recommendations]')
      .each((r) => {
        cy.wrap(r).should('not.have.value', 0);
      });
  });

  it('can filter by name', () => {
    // search by "cc" search input
    cy.get(TOOLBAR_FILTER).find('.pf-c-form-control').type('cc');
    // should be 4 clusters left
    cy.get(TBODY)
      .children()
      .should('have.length', 4)
      .each((r) => {
        cy.wrap(r).contains('cc');
      });
  });

  it('can sort by columns', () => {
    // check initial state
    cy.getFirstRow()
      .find('td[data-label=Name]')
      .should('have.text', 'cc59cabb-cb40-4a7e-8665-feb822a210e3');
    // click on the Name sorting button
    cy.get('.pf-c-table__sort').eq(0).click();
    cy.getFirstRow()
      .find('td[data-label=Name]')
      .should('have.text', '1ghhxwjfoi 5b5hbyv07');
    // click on the Recommendations sorting button
    cy.get('.pf-c-table__sort').eq(1).click();
    // the first cluster has 0 recommendations
    cy.getFirstRow()
      .find('td[data-label=Recommendations]')
      .should('have.text', 0);
  });

  it('some rows have cluster names instead uuids', () => {
    /* the cluster with uuid "fc603601-0ff8-45e4-b0f3-c7f76d2ef36b" 
       has a display name "gsbq8pthf xah3olxhz" */
    cy.get(TBODY)
      .children()
      .eq(4)
      .find('td[data-label=Name]')
      .should('have.text', 'gsbq8pthf xah3olxhz');
  });

  it('names of rows are links', () => {
    cy.getFirstRow()
      .find('td[data-label=Name]')
      .find('a[href="/clusters/cc59cabb-cb40-4a7e-8665-feb822a210e3"]')
      .should('have.text', 'cc59cabb-cb40-4a7e-8665-feb822a210e3');
  });
});
