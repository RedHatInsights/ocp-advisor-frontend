import React from 'react';
import PropTypes from 'prop-types';

import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';

export const translations = {
  en: require('../../compiled-lang/en.json'),
};

export const strong = (str) => <strong>{str}</strong>;

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

Intl.propTypes = {
  children: PropTypes.element,
};
