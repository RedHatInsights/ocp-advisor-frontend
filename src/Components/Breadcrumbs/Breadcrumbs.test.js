import { mount } from 'enzyme';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';

describe('<Breadcrumbs /> test', () => {
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
  test('should render breadcrumb with two items', () => {
    const shallowed = mount(
      <Router>
        <Breadcrumbs {...props} />
      </Router>
    );
    expect(shallowed.find('BreadcrumbItem')).toHaveLength(2);
  });
});
