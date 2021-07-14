import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import getAdvisorStore from '../AppReducer';

const getStore = (useLogger) =>
  configureStore({
    reducer: getAdvisorStore(),
    middleware: (getDefaultMiddleware) =>
      useLogger
        ? getDefaultMiddleware().concat(logger)
        : getDefaultMiddleware(),
  });

export default getStore;
