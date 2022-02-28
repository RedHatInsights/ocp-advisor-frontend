import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import ReportDetails from './ReportDetails';
import getStore from '../../Store';
import clusterReport from '../../../cypress/fixtures/Cluster/report.json';
import { Intl } from '../../Utilities/intlHelper';
import '@patternfly/patternfly/patternfly.scss';

const data = clusterReport['report']['data'][0];

describe('data', () => {
  it('is not empty', () => {
    cy.wrap(data).should('not.be.empty');
  });
});

// TODO load async component

describe('report details with data', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <ReportDetails report={data} />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('renders', () => {});
});
