import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init } from './Store';
import App from './App';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import messages from '../locales/data.json';

const AppEntry = () => (
  <IntlProvider
    locale={navigator.language.slice(0, 2)}
    messages={messages}
    onError={console.log}
  >
    <Provider store={init().getStore()}>
      <Router basename={getBaseName(window.location.pathname)}>
        <App />
      </Router>
    </Provider>
  </IntlProvider>
);

export default AppEntry;
