import React from 'react';
import { mount } from '@cypress/react18';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import DisableRule from './DisableRule';
import { Intl } from '../../Utilities/intlHelper';
import getStore from '../../Store';
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

    cy.intercept('POST', '/api/insights-results-aggregator/v2/ack', {
      statusCode: 200,
    }).as('ackRequest');
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
    cy.wait('@ackRequest').then((xhr) =>
      expect(xhr.request.body.justification).to.eq('query')
    );
  });

  it('justification note can be empty', () => {
    cy.get(SAVE_BUTTON).click();
    cy.wait('@ackRequest').then(
      (xhr) => expect(xhr.request.body.justification).to.be.empty
    );
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
              rule={{ rule_id: 'foo|BAR', disabled: false }}
              host={'7795cbcd-0353-4e59-b920-fc1c39a27014'}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );

    cy.intercept('POST', '/api/insights-results-aggregator/v2/ack', {
      statusCode: 200,
    }).as('ackRequest');

    cy.intercept(
      'PUT',
      '/api/insights-results-aggregator/v1/clusters/**/rules/**/error_key/**/disable',
      {
        statusCode: 200,
      }
    ).as('disableRequest');
  });

  it('exits', () => {
    cy.get(MODAL).should('exist');
    cy.get(CHECKBOX).should('exist').and('be.checked');
  });

  it('triggers only 1 disable call', () => {
    cy.get(SAVE_BUTTON).click();
    cy.wait('@disableRequest');

    // TODO check page is reloaded afterwards
  });

  it('removing checkbox triggers ack', () => {
    cy.get(CHECKBOX).click().should('not.be.checked');
    cy.get(SAVE_BUTTON).click();
    cy.wait('@ackRequest').then((xhr) =>
      expect(xhr.request.body.rule_id).to.eq('foo|BAR')
    );
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
              rule={{ rule_id: 'foo|BAR', disabled: false }}
              hosts={[
                {
                  id: '084ac7a7-1c7d-49ff-b56e-f94881da242d',
                },
                {
                  id: '7795cbcd-0353-4e59-b920-fc1c39a27014',
                },
              ]}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );

    cy.intercept('POST', '/api/insights-results-aggregator/v2/ack', {
      statusCode: 200,
    }).as('ackRequest');

    cy.intercept(
      'PUT',
      '/api/insights-results-aggregator/v1/clusters/**/rules/**/error_key/**/disable',
      {
        statusCode: 200,
      }
    ).as('disableRequest');
  });

  it('exits', () => {
    cy.get(MODAL).should('exist');
    cy.get(CHECKBOX).should('exist').and('be.checked');
  });

  it('triggers multiple disable call', () => {
    cy.get(SAVE_BUTTON).click();
    cy.wait('@disableRequest').then(
      (xhr) =>
        expect(
          /084ac7a7-1c7d-49ff-b56e-f94881da242d|7795cbcd-0353-4e59-b920-fc1c39a27014/.test(
            xhr.request.url
          )
        ).to.be.true
    );

    // TODO check page is reloaded afterwards
  });

  it('removing checkbox triggers ack', () => {
    cy.get(CHECKBOX).click().should('not.be.checked');
    cy.get(SAVE_BUTTON).click();
    cy.wait('@ackRequest').then((xhr) =>
      expect(xhr.request.body.rule_id).to.eq('foo|BAR')
    );
  });
});
