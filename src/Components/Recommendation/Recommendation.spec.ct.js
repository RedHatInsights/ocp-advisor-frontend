import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { Recommendation } from './Recommendation';
import getStore from '../../Store';
import ruleProps from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule/external.rules.rule|ERROR_KEY/report.json';
import ackProps from '../../../cypress/fixtures/api/insights-results-aggregator/v2/ack/external.rules.rule|ERROR_KEY/report.json';
import clusterDetailsProps from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule/external.rules.rule|ERROR_KEY/clusters_detail/report.json';
import { Intl } from '../../Utilities/intlHelper';
import '@patternfly/patternfly/patternfly.scss';

describe('data', () => {
  it('is not empty', () => {
    cy.wrap(ruleProps['content']).should('not.be.empty');
  });
});

// TODO load async component

describe('report details with data', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <Recommendation
              rule={ruleProps}
              ack={{}}
              clusters={clusterDetailsProps}
              match={{
                params: { recommendationId: 'This is a test recommendation' },
              }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('renders', () => {});
});
