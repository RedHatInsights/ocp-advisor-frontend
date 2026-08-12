// ***********************************************************
// This example support/component.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import '@cypress/code-coverage/support';
import { useChrome } from '../../config/overrideChrome';
import mockChrome from '../../config/mockChrome';

// Alternatively you can use CommonJS syntax:
// require('./commands')
import '@patternfly/patternfly/patternfly.scss';
import { mount } from 'cypress/react';

Cypress.Commands.add('mount', mount);
window.insights = { useChrome };

// Example use:
// cy.mount(<MyComponent />)
global.window.insights = {
  chrome: mockChrome,
};
