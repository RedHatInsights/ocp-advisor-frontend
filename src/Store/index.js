import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import { notificationsMiddleware } from '@redhat-cloud-services/frontend-components-notifications/';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';

import { AmsApi } from '../Services/AccountManagementService';
import { SmartProxyApi } from '../Services/SmartProxy';
import filters from '../Services/Filters';
import { Acks } from '../Services/Acks';

const reducer = {
  [SmartProxyApi.reducerPath]: SmartProxyApi.reducer,
  [AmsApi.reducerPath]: AmsApi.reducer,
  filters,
  notifications: notificationsReducer,
  [Acks.reducerPath]: Acks.reducer,
};

const getStore = (useLogger) =>
  configureStore({
    reducer,
    middleware: (getDefaultMiddleware) => {
      const middleware = getDefaultMiddleware().concat(
        SmartProxyApi.middleware,
        AmsApi.middleware,
        Acks.middleware,
        notificationsMiddleware({
          errorTitleKey: ['message'],
          errorDescriptionKey: ['response.data.detail'],
        })
      );
      if (useLogger) {
        middleware.concat(logger);
      }
      return middleware;
    },
  });

export default getStore;
