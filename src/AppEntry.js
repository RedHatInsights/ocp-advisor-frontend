import React from 'react';
import PropTypes from 'prop-types';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers/helpers';
import App from './App';
import { Intl } from './Utilities/intlHelper';

const AppEntry = ({ useLogger }) => {
  return (
    <Intl>
      <App
        useLogger={useLogger}
        basename={getBaseName(window.location.pathname)}
      />
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
