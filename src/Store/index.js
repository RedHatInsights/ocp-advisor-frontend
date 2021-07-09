import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import getAdvisorStore from '../AppReducer';

const store = configureStore({
  reducer: getAdvisorStore(),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export default store;
