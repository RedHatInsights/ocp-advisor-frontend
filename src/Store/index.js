import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import { AmsApi } from '../Services/AccountManagementService';
import { SmartProxyApi } from '../Services/SmartProxy';
import filters from '../Services/Filters';

const reducer = {
  [SmartProxyApi.reducerPath]: SmartProxyApi.reducer,
  [AmsApi.reducerPath]: AmsApi.reducer,
  filters,
};

const getStore = (useLogger) =>
  configureStore({
    reducer,
    middleware: (getDefaultMiddleware) => {
      const middleware = getDefaultMiddleware().concat(
        SmartProxyApi.middleware,
        AmsApi.middleware
      );
      if (useLogger) {
        middleware.concat(logger);
      }
      return middleware;
    },
  });

export default getStore;
