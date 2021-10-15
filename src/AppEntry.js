import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';

import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers/helpers';

import App from './App';
import getStore from './Store';

const translations = {
  en: require('../compiled-lang/en.json'),
};

const AppEntry = (useLogger) => (
  <IntlProvider
    locale={navigator.language.slice(0, 2)}
    defaultLocale="en"
    messages={translations[navigator.language.slice(0, 2)]}
    onError={console.error}
  >
    <Provider store={getStore(useLogger)}>
      <Router basename={getBaseName(window.location.pathname, 3)}>
        <App />
      </Router>
    </Provider>
  </IntlProvider>
);

AppEntry.propTypes = {
  useLogger: PropTypes.bool,
};

AppEntry.defaultProps = {
  useLogger: false,
};

export default AppEntry;
