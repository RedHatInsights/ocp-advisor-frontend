import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router } from 'react-router-dom';

import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers/helpers';

import App from './App';

const translations = {
  en: require('../compiled-lang/en.json'),
};

const AppEntry = ({ useLogger }) => (
  <IntlProvider
    locale={navigator.language.slice(0, 2)}
    defaultLocale="en"
    messages={translations[navigator.language.slice(0, 2)]}
    onError={console.error}
  >
    <Router basename={getBaseName(window.location.pathname, 3)}>
      <App useLogger={useLogger} />
    </Router>
  </IntlProvider>
);

AppEntry.propTypes = {
  useLogger: PropTypes.bool,
};

AppEntry.defaultProps = {
  useLogger: false,
};

export default AppEntry;
