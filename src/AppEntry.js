import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './Store';
import App from './App';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import messages from '../locales/data.json';

const translations = {
  en: require('../compiled-lang/en.json'),
};
  <IntlProvider
    locale={navigator.language.slice(0, 2)}
    defaultLocale="en"
    messages={translations[navigator.language.slice(0, 2)]}
    onError={console.error}
  >
    <Provider store={store}>
      <Router basename={getBaseName(window.location.pathname, 3)}>
        <App />
      </Router>
    </Provider>
  </IntlProvider>
);

export default AppEntry;
