import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import DisableRule from './DisableRule';
import { Intl } from '../../Utilities/intlHelper';
import getStore from '../../Store';
import '@patternfly/patternfly/patternfly.scss';
import {
  ouiaId,
  CHECKBOX,
  TEXT_INPUT,
} from '../../../cypress/utils/components';

const MODAL = ouiaId('recommendation-disable');
const SAVE_BUTTON = ouiaId('confirm');
const CANCEL_BUTTON = ouiaId('cancel');

describe('modal without hosts', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <DisableRule
              isModalOpen={true}
              rule={{ rule_id: 'abc', disabled: false }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('exits', () => {
    cy.get(MODAL).should('exist');
    cy.get(CHECKBOX).should('not.exist');

    // TODO check that no request is send

    // TODO check page is reloaded afterwards
  });

  it('does not trigger function on cancel', () => {
    cy.get(CANCEL_BUTTON).click();
    // TODO which component is the function that needs to be triggered?
    // TODO add a stub to that function
  });

  it('justification note is fillable', () => {
    cy.get(TEXT_INPUT).type('query');
    cy.get(SAVE_BUTTON).click();

    // TODO intercept query and check justification text
  });

  it('justification note can be empty', () => {
    cy.get(SAVE_BUTTON).click();

    // TODO intercept query and check justification text is empty string
  });
});

describe('modal with 1 host', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <DisableRule
              isModalOpen={true}
              rule={{ rule_id: 'abc', disabled: false }}
              host={'uuid'} // TODO use fixture with an UUID
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('exits', () => {
    cy.get(MODAL).should('exist');
    cy.get(CHECKBOX).should('exist').and('be.checked');
  });

  it('triggers only 1 disable call', () => {
    cy.get(SAVE_BUTTON).click();
    // TODO check that no request is send

    // TODO check page is reloaded afterwards
  });

  it('removing checkbox triggers ack', () => {
    cy.get(CHECKBOX).click().should('not.be.checked');
    cy.get(SAVE_BUTTON).click();

    // TODO intercept query and check ack is send
  });
});

describe('modal with multiple hosts', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <DisableRule
              isModalOpen={true}
              rule={{ rule_id: 'abc', disabled: false }}
              hosts={['1', '2']} // TODO use fixture with an UUID
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('exits', () => {
    cy.get(MODAL).should('exist');
    cy.get(CHECKBOX).should('exist').and('be.checked');
  });

  it('triggers multiple disable call', () => {
    cy.get(SAVE_BUTTON).click();
    // TODO check that no request is send

    // TODO check page is reloaded afterwards
  });

  it('removing checkbox triggers ack', () => {
    cy.get(CHECKBOX).click().should('not.be.checked');
    cy.get(SAVE_BUTTON).click();

    // TODO intercept query and check ack is send
  });
});
