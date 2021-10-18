import * as React from 'react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router';
import PropTypes from 'prop-types';

const ContextWrapper = ({ children }) => (
  <MemoryRouter>
    <IntlProvider locale="en">{children}</IntlProvider>
  </MemoryRouter>
);

ContextWrapper.propTypes = {
  children: PropTypes.node,
};

export { ContextWrapper };
