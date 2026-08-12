import './App.scss';

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import NotificationsProvider from '@redhat-cloud-services/frontend-components-notifications/NotificationsProvider';
import { Bullseye, Spinner } from '@patternfly/react-core';
import LockIcon from '@patternfly/react-icons/dist/js/icons/lock-icon';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { AppRoutes } from './Routes';
import ErrorBoundary from './Utilities/ErrorBoundary';
import MessageState from './Components/MessageState/MessageState';
import messages from './Messages';
import getStore from './Store';

const App = ({ useLogger }) => {
  const intl = useIntl();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const chrome = useChrome();

  useEffect(() => {
    if (chrome) {
      chrome.auth.getUser().then(() => {
        setIsAuthenticated(true);
        setIsLoading(false);
      });
    }
  }, [chrome]);

  return (
    <ErrorBoundary>
      {isLoading ? (
        <Bullseye>
          <Spinner />
        </Bullseye>
      ) : isAuthenticated ? (
        <Provider store={getStore(useLogger)}>
          <NotificationsProvider>
            <AppRoutes />
          </NotificationsProvider>
        </Provider>
      ) : (
        <Bullseye>
          <MessageState
            variant="large"
            icon={LockIcon}
            title={intl.formatMessage(messages.permsTitle)}
            text={intl.formatMessage(messages.permsBody)}
          />
        </Bullseye>
      )}
    </ErrorBoundary>
  );
};

App.propTypes = {
  useLogger: PropTypes.bool,
};

App.defaultProps = {
  useLogger: false,
};

export default App;
