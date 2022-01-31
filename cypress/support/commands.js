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

import { Widget } from '../widgets/widgets';

Cypress.Commands.add('locate', { prevSubject: 'optional' }, (subject, item) => {
  return item instanceof Widget
    ? item.locate()
    : subject
    ? subject.find(item)
    : cy.get(item);
});

Cypress.Commands.add(
  'byOuiaId',
  { prevSubject: 'optional' },
  (subject, item) => {
    const attr = `[data-ouia-component-id="${item}"]`;
    return subject ? subject.find(attr) : cy.get(attr);
  }
);
