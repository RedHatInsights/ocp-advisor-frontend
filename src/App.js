import './App.scss';

import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry/Registry';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';

import { Routes } from './Routes';

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
    <React.Fragment>
      <NotificationsPortal />
      <div className="ocp-advisor">
        <Routes />
      </div>
    </React.Fragment>
  );
};

export default App;
