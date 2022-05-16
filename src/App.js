import './App.scss';

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry/Registry';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { Bullseye } from '@patternfly/react-core/';
import LockIcon from '@patternfly/react-icons/dist/js/icons/lock-icon';
import { Spinner } from '@patternfly/react-core/';

import { Routes } from './Routes';
import ErrorBoundary from './Utilities/ErrorBoundary';
import MessageState from './Components/MessageState/MessageState';
import messages from './Messages';
import getStore from './Store';

const App = ({ useLogger, basename }) => {
  const intl = useIntl();
  const history = useHistory();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const registry = getRegistry();
    registry.register({ notifications: notificationsReducer });
    insights.chrome.init();
    insights.chrome.auth.getUser().then(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
    });
    insights.chrome.identifyApp('ocp-advisor');
    const unregister = insights.chrome.on('APP_NAVIGATION', (event) => {
      const targetUrl = event.domEvent?.href
        ?.replace(basename, '/')
        .replace(/^\/\//, '/');
      if (typeof targetUrl === 'string') {
        history.push(targetUrl);
      }
    });
    return () => unregister();
  }, []);
  return (
    <ErrorBoundary>
      {isLoading ? (
        <Bullseye>
          <Spinner />
        </Bullseye>
      ) : isAuthenticated ? (
        <Provider store={getStore(useLogger)}>
          <NotificationsPortal />
          <Routes />
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
  basename: PropTypes.string.isRequired,
};

App.defaultProps = {
  useLogger: false,
};

export default App;
