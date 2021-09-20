import { mount } from '@cypress/react'
import React from 'react';
import {IntlProvider} from 'react-intl';

import { Breadcrumbs } from './Breadcrumbs';


it('renders Breadcrumbs', () => {
  const props = {
    current: 'foobar',
    match: {
      url: '/clusters/foobar',
      params: {
        clusterId: 'foobar',
      },
    },
  };
  mount(<IntlProvider locale="en"><Breadcrumbs {...props} /></IntlProvider>)
})