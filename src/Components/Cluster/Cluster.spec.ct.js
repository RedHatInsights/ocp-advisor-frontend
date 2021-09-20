import { mount } from '@cypress/react'
import React from 'react';
import {IntlProvider} from 'react-intl';
import {MemoryRouter} from 'react-router-dom';
import Main from '@redhat-cloud-services/frontend-components/Main';

import { Cluster } from './Cluster';



it('renders Cluster', () => {
  const props = {
    cluster: {
      isError: false,
      isUninitialized: false,
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      data: {},
    },
    match: {
      params: {
        clusterId: 'foobar',
      },
      url: 'foobar',
    },
  };
  
  mount(
    <MemoryRouter>
      <IntlProvider locale="en">
        <Cluster {...props} />
      </IntlProvider>
    </MemoryRouter>
  )
})