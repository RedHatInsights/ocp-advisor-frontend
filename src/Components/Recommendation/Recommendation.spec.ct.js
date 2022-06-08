import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Intl } from '../../Utilities/intlHelper';
import getStore from '../../Store';
import _ from 'lodash';

import { Recommendation } from './Recommendation';
import rule from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule/external.rules.rule|ERROR_KEY.json';
import ack from '../../../cypress/fixtures/api/insights-results-aggregator/v2/ack/external.rules.rule|ERROR_KEY.json';
import clusterDetails from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule/external.rules.rule|ERROR_KEY/clusters_detail.json';

const defaultPropsRule = {
  isError: false,
  isUninitialized: false,
  isLoading: false,
  isFetching: false,
  isSuccess: true,
  data: rule,
  refetch: undefined,
};

const defaultPropsAck = {
  data: ack,
  isFetching: false,
  refetch: undefined,
};

const defaultPropsClusterDetails = {
  data: clusterDetails.data,
  isFetching: false,
  refetch: undefined,
};

describe('breadcrumbs', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <Recommendation
              rule={{ ...defaultPropsRule }}
              ack={{ ...defaultPropsAck, data: undefined }}
              clusters={{ ...defaultPropsClusterDetails }}
              match={{ params: { recommendationId: 'X' } }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('category labels are displayed', () => {
    // TODO
    cy.get('h1').should('have.length', 2);
  });
});
