import './App.scss';

import React, { Fragment, useEffect } from 'react';

import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { Routes } from './Routes';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { useHistory } from 'react-router-dom';

const App = () => {
  const history = useHistory();

  useEffect(() => {
    const registry = getRegistry();
    registry.register({ notifications: notificationsReducer });
    insights.chrome.init();

    insights.chrome.identifyApp('ocp-advisor');
    const unregister = insights.chrome.on('APP_NAVIGATION', (event) =>
      history.push(`/${event.navId}`)
    );
    return () => {
      unregister();
    };
  }, []);

  return (
    <Fragment>
      <NotificationsPortal />
      <Routes />
    </Fragment>
  );
};

export default App;
