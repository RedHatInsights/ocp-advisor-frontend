import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import { AmsApi } from '../Services/AccountManagementService';
import { SmartProxyApi } from '../Services/SmartProxy';
import { SmartProxyMockedApi } from '../Services/SmartProxyMocked';
import filters from '../Services/Filters';

const reducer = {
  [SmartProxyApi.reducerPath]: SmartProxyApi.reducer,
  [SmartProxyMockedApi.reducerPath]: SmartProxyMockedApi.reducer,
  [AmsApi.reducerPath]: AmsApi.reducer,
  filters,
};

const getStore = (useLogger) =>
  configureStore({
    reducer,
    middleware: (getDefaultMiddleware) => {
      const middleware = getDefaultMiddleware().concat(
        SmartProxyApi.middleware,
        SmartProxyMockedApi.middleware,
        AmsApi.middleware
      );
      if (useLogger) {
        middleware.concat(logger);
      }
      return middleware;
    },
  });

export default getStore;
