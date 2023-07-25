import './App.scss';

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry/Registry';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
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
      const registry = getRegistry();
      registry.register({ notifications: notificationsReducer });
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
          <NotificationsPortal />
          <AppRoutes />
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
