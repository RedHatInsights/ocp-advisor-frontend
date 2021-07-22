import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import { amsApi } from '../Services/AccountManagementService';
import { smartProxyApi } from '../Services/SmartProxy';

const getStore = (useLogger) =>
  configureStore({
    reducer: {
      [smartProxyApi.reducerPath]: smartProxyApi.reducer,
      [amsApi.reducerPath]: amsApi.reducer,
    },
    middleware: (getDefaultMiddleware) => {
      const middleware = getDefaultMiddleware().concat(
        smartProxyApi.middleware,
        amsApi.middleware
      );
      if (useLogger) {
        middleware.concat(logger);
      }
      return middleware;
    },
  });

export default getStore;
