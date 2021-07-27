import { shallow } from 'enzyme';
import React from 'react';

import { Cluster } from './Cluster';

jest.mock('../ClusterHeader', () => jest.fn());

describe('<Cluster /> test', () => {
  let props;

  beforeEach(() => {
    props = {
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
  });
  test('renders correctly', () => {
    const shallowed = shallow(<Cluster {...props} />);
    expect(shallowed).toMatchSnapshot();
  });
  test('renders correctly when cluster loading', () => {
    props.cluster.isFetching = true;
    props.cluster.isSuccess = false;
    const shallowed = shallow(<Cluster {...props} />);
    expect(shallowed).toMatchSnapshot();
  });
  test('renders correctly when cluster unavailable', () => {
    props.cluster.isError = true;
    props.cluster.isSuccess = false;
    const shallowed = shallow(<Cluster {...props} />);
    expect(shallowed).toMatchSnapshot();
  });
});
