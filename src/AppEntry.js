import React from 'react';
import PropTypes from 'prop-types';
import App from './App';
import { Intl } from './Utilities/intlHelper';

const AppEntry = ({ useLogger }) => {
  return (
    <Intl>
      <App useLogger={useLogger} />
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
