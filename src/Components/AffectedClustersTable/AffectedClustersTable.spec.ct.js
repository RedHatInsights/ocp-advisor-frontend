import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { AffectedClustersTable } from './AffectedClustersTable';
import props from '../../../cypress/fixtures/AffectedClustersTable/data.json';
import { Intl } from '../../AppEntry';
import getStore from '../../Store';

describe('affected clusters table', () => {
  const AFFECTED_LIST_TABLE = 'div[id=affected-list-table]';
  const ROW = 'tbody[role=rowgroup]';

  beforeEach(() => {
    mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <AffectedClustersTable
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
    cy.get(AFFECTED_LIST_TABLE).should('have.length', 1);
  });

  it('shows first ten clusters', () => {
    cy.get(AFFECTED_LIST_TABLE).find(ROW).children().should('have.length', 10);
  });

  it('paginatation feature', () => {
    const PAGINATION_MENU =
      'div[data-ouia-component-type="PF4/PaginationOptionsMenu"]';

    cy.get(AFFECTED_LIST_TABLE).find(ROW).children().should('have.length', 10);
    cy.get(PAGINATION_MENU)
      .first()
      .find('button[data-ouia-component-type="PF4/DropdownToggle"]')
      .click();
    cy.get(PAGINATION_MENU)
      .first()
      .find('ul[class=pf-c-options-menu__menu]')
      .find('li')
      .eq(1)
      .find('button')
      .click({ force: true }); // caused by the css issue
    cy.get(AFFECTED_LIST_TABLE).find(ROW).children().should('have.length', 12);
  });
});
