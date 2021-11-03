import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router } from 'react-router-dom';

import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers/helpers';

import App from './App';

const translations = {
  en: require('../compiled-lang/en.json'),
};

export const Intl = ({ children }) => (
  <IntlProvider
    locale={navigator.language.slice(0, 2)}
    defaultLocale="en"
    messages={translations[navigator.language.slice(0, 2)]}
    onError={console.error}
  >
    {children}
  </IntlProvider>
);

const AppEntry = ({ useLogger }) => (
  <Intl>
    <Router basename={getBaseName(window.location.pathname, 3)}>
      <App useLogger={useLogger} />
    </Router>
  </Intl>
);

Intl.propTypes = {
  children: PropTypes.element,
};

AppEntry.propTypes = {
  useLogger: PropTypes.bool,
};

AppEntry.defaultProps = {
  useLogger: false,
};

export default AppEntry;
