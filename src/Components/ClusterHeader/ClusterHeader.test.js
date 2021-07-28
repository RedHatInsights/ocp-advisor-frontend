import { shallow } from 'enzyme';
import React from 'react';

import { ClusterHeader } from './ClusterHeader';

describe('<ClusterHeader /> test', () => {
  let props;

  beforeEach(() => {
    props = {
      clusterId: 'foobar',
      displayName: {
        isError: false,
        isUninitialized: false,
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        data: 'Cluster with issues',
      },
      lastSeen: '2021-07-24T14:22:36.109Z',
    };
  });
  test('renders correctly', () => {
    const shallowed = shallow(<ClusterHeader {...props} />);
    expect(shallowed).toMatchSnapshot();
  });
  test('renders correctly when loading', () => {
    props.displayName.isFetching = true;
    props.displayName.isSuccess = false;
    const shallowed = shallow(<ClusterHeader {...props} />);
    expect(shallowed).toMatchSnapshot();
  });
  test('renders correctly without display name available', () => {
    props.displayName.data = undefined;
    const shallowed = shallow(<ClusterHeader {...props} />);
    expect(shallowed).toMatchSnapshot();
  });
  test('renders correctly without last seen available', () => {
    props.lastSeen = undefined;
    const shallowed = shallow(<ClusterHeader {...props} />);
    expect(shallowed).toMatchSnapshot();
  });
});
