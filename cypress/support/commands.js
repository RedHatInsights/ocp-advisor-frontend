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

import { mount } from '@cypress/react18';
import FlagProvider from '@unleash/proxy-client-react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import getStore from '../../src/Store';
import { Intl } from '../../src/Utilities/intlHelper';

Cypress.Commands.add(
  'ouiaId',
  { prevSubject: 'optional' },
  (subject, item, el = '') => {
    const attr = `${el}[data-ouia-component-id="${item}"]`;
    return subject ? cy.wrap(subject).find(attr) : cy.get(attr);
  }
);

Cypress.Commands.add(
  'ouiaType',
  { prevSubject: 'optional' },
  (subject, item, el = '') => {
    const attr = `${el}[data-ouia-component-type="${item}"]`;
    return subject ? cy.wrap(subject).find(attr) : cy.get(attr);
  }
);

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
