import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import promiseMiddleware from 'redux-promise-middleware';
import notificationsMiddleware from '@redhat-cloud-services/frontend-components-notifications/notificationsMiddleware';
import { compose } from 'redux';

let registry;

const localStorage = (store) => (next) => (action) => {
  next(action);
  const activeStore = store.getState().AdvisorStore;
  sessionStorage.setItem('AdvisorStore', JSON.stringify(activeStore));
};

export function init(...middleware) {
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  registry = getRegistry(
    {},
    [
      ...middleware,
      promiseMiddleware,
      notificationsMiddleware({ errorDescriptionKey: ['detail', 'stack'] }),
      localStorage,
    ],
    composeEnhancers
  );
  return registry;
}

export function getStore() {
  return registry.getStore();
}

export function register(...args) {
  return registry.register(...args);
}
