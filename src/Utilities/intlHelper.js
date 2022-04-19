import React from 'react';
import PropTypes from 'prop-types';

import { IntlProvider } from '@redhat-cloud-services/frontend-components-translations/';
import messages from '../Messages';

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

// takes `messageIds` list and formats the messages using `values`
export const formatMessages = (intl, messageIds, values) =>
  Object.fromEntries(
    messageIds.map((id) => [
      id,
      messages[id] ? intl.formatMessage(messages[id], values[id]) : '',
    ])
  );
