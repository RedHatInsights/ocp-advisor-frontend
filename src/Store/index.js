import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import { SmartProxyApi } from '../Services/SmartProxy';
import filters from '../Services/Filters';
import { Acks } from '../Services/Acks';

const reducer = {
  [SmartProxyApi.reducerPath]: SmartProxyApi.reducer,
  filters,
  [Acks.reducerPath]: Acks.reducer,
};

const getStore = (useLogger) =>
  configureStore({
    reducer,
    middleware: (getDefaultMiddleware) => {
      const middleware = getDefaultMiddleware().concat(
        SmartProxyApi.middleware,
        Acks.middleware
      );
      if (useLogger) {
        middleware.concat(logger);
      }
      return middleware;
    },
  });

export default getStore;