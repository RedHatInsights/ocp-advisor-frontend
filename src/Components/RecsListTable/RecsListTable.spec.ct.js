import React from 'react';
import { mount } from '@cypress/react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import RecsListTable from './';
import getStore from '../../Store';

describe('recommendations list table', () => {
  it('renders component', () => {
    cy.intercept(
      'GET',
      'api/insights-results-aggregator/v2/rule?impacting=false',
      { fixture: 'rule.json' }
    );
    // make global objects `insights` declared in the outter scope
    window.insights = undefined;
    mount(
      <IntlProvider locale="en">
        <Provider store={getStore()}>
          <MemoryRouter initialEntries={['/recommendations']} initialIndex={0}>
            <RecsListTable />
          </MemoryRouter>
        </Provider>
      </IntlProvider>
    );
  });
});
