import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import { smartProxyApi } from '../Services/SmartProxy';

const getStore = (useLogger) =>
  configureStore({
    reducer: { [smartProxyApi.reducerPath]: smartProxyApi.reducer },
    middleware: (getDefaultMiddleware) =>
      useLogger
        ? getDefaultMiddleware().concat(logger, smartProxyApi.middleware)
        : getDefaultMiddleware().concat(smartProxyApi.middleware),
  });

export default getStore;
