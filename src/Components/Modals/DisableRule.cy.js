import React from 'react';

import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import DisableRule from './DisableRule';
import { Intl } from '../../Utilities/intlHelper';
import getStore from '../../Store';

import {
  CHECKBOX,
  TEXT_INPUT,
} from '@redhat-cloud-services/frontend-components-utilities';

const MODAL = 'recommendation-disable';
const SAVE_BUTTON = 'confirm';
const CANCEL_BUTTON = 'cancel';

describe('modal without hosts', () => {
  beforeEach(() => {
    cy.mount(
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
    cy.ouiaId(MODAL).should('exist');
    cy.get(CHECKBOX).should('not.exist');

    // TODO check that no request is send

    // TODO check page is reloaded afterwards
  });

  it('does not trigger function on cancel', () => {
    cy.ouiaId(CANCEL_BUTTON).click();
    // TODO which component is the function that needs to be triggered?
    // TODO add a stub to that function
  });

  it('justification note is fillable', () => {
    cy.get(TEXT_INPUT).type('query');
    cy.ouiaId(SAVE_BUTTON).click();
    cy.wait('@ackRequest').then((xhr) =>
      expect(xhr.request.body.justification).to.eq('query')
    );
  });

  it('justification note can be empty', () => {
    cy.ouiaId(SAVE_BUTTON).click();
    cy.wait('@ackRequest').then(
      (xhr) => expect(xhr.request.body.justification).to.be.empty
    );
  });
});

describe('modal with 1 host', () => {
  beforeEach(() => {
    cy.mount(
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
    cy.ouiaId(MODAL).should('exist');
    cy.get(CHECKBOX).should('exist').and('be.checked');
  });

  it('triggers only 1 disable call', () => {
    cy.ouiaId(SAVE_BUTTON).click();
    cy.wait('@disableRequest');

    // TODO check page is reloaded afterwards
  });

  it('removing checkbox triggers ack', () => {
    cy.get(CHECKBOX).click().should('not.be.checked');
    cy.ouiaId(SAVE_BUTTON).click();
    cy.wait('@ackRequest').then((xhr) =>
      expect(xhr.request.body.rule_id).to.eq('foo|BAR')
    );
  });
});

describe('modal with multiple hosts', () => {
  beforeEach(() => {
    cy.mount(
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
    cy.ouiaId(MODAL).should('exist');
    cy.get(CHECKBOX).should('exist').and('be.checked');
  });

  it('triggers multiple disable call', () => {
    cy.ouiaId(SAVE_BUTTON).click();
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
    cy.ouiaId(SAVE_BUTTON).click();
    cy.wait('@ackRequest').then((xhr) =>
      expect(xhr.request.body.rule_id).to.eq('foo|BAR')
    );
  });
});

describe.only('call order checking', () => {
  it('single host', () => {
    let responded = false;

    cy.mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <DisableRule
              isModalOpen={true}
              rule={{ rule_id: 'foo|BAR', disabled: false }}
              host={'7795cbcd-0353-4e59-b920-fc1c39a27014'}
              afterFn={() => {
                responded = true;
              }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );

    cy.intercept(
      'PUT',
      '/api/insights-results-aggregator/v1/clusters/**/rules/**/error_key/**/disable',
      {
        statusCode: 200,
        delay: 2 * 1000, // 2 secs
      }
    ).as('disableRequest');

    cy.ouiaId(SAVE_BUTTON).click();
    // wait for half the delay time, we expect the machine to be able to respond faster
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000).then(() => expect(responded).to.be.false);
  });

  it('multiple hosts', () => {
    let responded = false;

    // beforeEach(() => {
    cy.mount(
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
              afterFn={() => {
                responded = true;
              }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );

    cy.intercept(
      'PUT',
      '/api/insights-results-aggregator/v1/clusters/**/rules/**/error_key/**/disable',
      {
        statusCode: 200,
        delay: 2 * 1000, // 2 secs
      }
    ).as('disableRequest');

    cy.ouiaId(SAVE_BUTTON).click();
    // wait for half the delay time, we expect the machine to be able to respond faster
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000).then(() => expect(responded).to.be.false);
  });

  it('no hosts', () => {
    let responded = false;

    cy.mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <DisableRule
              isModalOpen={true}
              rule={{ rule_id: 'abc', disabled: false }}
              afterFn={() => {
                responded = true;
              }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );

    cy.intercept('POST', '/api/insights-results-aggregator/v2/ack', {
      statusCode: 200,
      delay: 2 * 1000, // 2 secs
    }).as('ackRequest');

    cy.ouiaId(SAVE_BUTTON).click();
    // wait for half the delay time, we expect the machine to be able to respond faster
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000).then(() => expect(responded).to.be.false);
  });
});
