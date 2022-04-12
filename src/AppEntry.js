import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router } from 'react-router-dom';

import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers/helpers';

import App from './App';
import { Intl } from './Utilities/intlHelper';

const AppEntry = ({ useLogger }) => {
  const basename = getBaseName(window.location.pathname, 3);
  return (
    <Intl>
      <Router basename={basename}>
        <App useLogger={useLogger} basename={basename.replace('/beta/', '/')} />
      </Router>
    </Intl>
  );
};

AppEntry.propTypes = {
  useLogger: PropTypes.bool,
};

AppEntry.defaultProps = {
  useLogger: false,
};

export default AppEntry;
