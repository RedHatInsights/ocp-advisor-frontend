// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import { mount } from 'cypress/react';
import FlagProvider from '@unleash/proxy-client-react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import getStore from '../../src/Store';
import { Intl } from '../../src/Utilities/intlHelper';

// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  findElementByOuiaId,
  findElementByOuiaType,
} from '@redhat-cloud-services/frontend-components-utilities';
import { checkRowCounts } from '../utils/table';

// Init commands
findElementByOuiaId();
findElementByOuiaType();

Cypress.Commands.add('mountWithContext', (component, options = {}) => {
  const { path, routerProps = { initialEntries: ['/'] } } = options;

  return mount(
    <FlagProvider
      config={{
        url: 'http://localhost:8002/feature_flags',
        clientKey: 'abc',
        appName: 'abc',
      }}
    >
      <Intl>
        <Provider store={getStore()}>
          <MemoryRouter {...routerProps}>
            {path ? (
              <Routes>
                <Route path={options.path} element={component} />
              </Routes>
            ) : (
              component
            )}
          </MemoryRouter>
        </Provider>
      </Intl>
    </FlagProvider>
  );
});

Cypress.Commands.add('checkEmptyState', (title, checkIcon) => {
  checkRowCounts(1);
  cy.get('table')
    .ouiaId('empty-state')
    .should('have.length', 1)
    .within(() => {
      cy.get('.pf-c-empty-state__icon').should(
        'have.length',
        checkIcon ? 1 : 0
      );
      cy.get(`h5[class="pf-v5-c-empty-state__title-text"]`).should(
        'have.text',
        title
      );
    });
});
