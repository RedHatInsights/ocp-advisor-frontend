import React from 'react';

global.shallow = shallow;
global.render = render;
global.mount = mount;
global.React = React;
global.navigator = { language: 'en-US' };

jest.mock('react-intl', () => {
  const reactIntl = jest.requireActual('react-intl');
  const intl = reactIntl.createIntl({
    locale: 'en',
  });

  return {
    ...reactIntl,
    useIntl: () => intl,
  };
});
