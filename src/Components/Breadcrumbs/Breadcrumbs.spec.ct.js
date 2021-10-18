import { mount } from '@cypress/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router';

import Breadcrumbs from './';

describe('breadcrumbs', () => {
  let props;

  beforeEach(() => {
    props = {
      current: 'foobar',
      match: {
        url: '/clusters/foobar',
        params: {
          clusterId: 'foobar',
        },
      },
    };
  });
  it('renders breadcrumbs A', () => {
    props.current = 'barfoo';
    mount(
      <MemoryRouter>
        <IntlProvider locale="en">
          <Breadcrumbs {...props} />
        </IntlProvider>
      </MemoryRouter>
    );
  });
  it('renders breadcrumbs B', () => {
    mount(
      <MemoryRouter>
        <IntlProvider locale="en">
          <Breadcrumbs {...props} />
        </IntlProvider>
      </MemoryRouter>
    );
  });
});
