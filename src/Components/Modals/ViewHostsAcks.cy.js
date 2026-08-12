import React from 'react';

import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import _ from 'lodash';

import ViewHostAcks from './ViewHostAcks';
import { Intl } from '../../Utilities/intlHelper';
import getStore from '../../Store';
import clusterDetails from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule/external.rules.rule|ERROR_KEY/clusters_detail.json';
import { TBODY, ROW } from '../../../cypress/utils/components';

const MODAL = 'hosts-disabled';

const defaultPropsClusterDetails = {
  data: clusterDetails.data,
  isFetching: false,
  isSuccess: true,
  refetch: undefined,
};

describe('modal with hosts', () => {
  beforeEach(() => {
    cy.mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <ViewHostAcks
              isModalOpen={true}
              clusters={{ ...defaultPropsClusterDetails }}
              recId={'abc|xyz'}
            />
          </Provider>
        </Intl>
      </MemoryRouter>,
    );

    cy.intercept(
      'PUT',
      '/api/insights-results-aggregator/v1/clusters/**/rules/**/error_key/**/enable',
      {
        statusCode: 200,
      },
    ).as('enableRequest');
  });

  it('exits', () => {
    cy.ouiaId(MODAL).should('exist');
  });

  it('empty justification notes are rendered as None', () => {
    const justifications = _.map(
      clusterDetails.data.disabled,
      (it) => it.justification || 'None',
    );
    cy.get(`td[data-label="Justification note"]`)
      .then(($els) => {
        return _.map(Cypress.$.makeArray($els), 'innerText');
      })
      .should('deep.equal', justifications);
  });

  it('clusters can be enabled', () => {
    cy.get('table')
      .find(TBODY)
      .find(ROW)
      .first()
      .ouiaId('enable')
      .click()
      .then(() => {
        cy.wait('@enableRequest').then((xhr) => {
          expect(xhr.request.url).to.contain(
            clusterDetails.data.disabled[0].cluster_id,
          );
          expect(xhr.request.url).to.contain('abc.report');
          expect(xhr.request.url).to.contain('xyz');
        });
      });
  });
});
