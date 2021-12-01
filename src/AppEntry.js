import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router } from 'react-router-dom';

import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers/helpers';

import App from './App';
import { Intl } from './Utilities/intlHelper';

const AppEntry = ({ useLogger }) => (
  <Intl>
    <Router basename={getBaseName(window.location.pathname, 3)}>
      <App useLogger={useLogger} />
    </Router>
  </Intl>
);

AppEntry.propTypes = {
  useLogger: PropTypes.bool,
};

AppEntry.defaultProps = {
  useLogger: false,
};

export default AppEntry;
