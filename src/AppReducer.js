import * as ActionTypes from './AppConstants';

import Immutable from 'seamless-immutable';

const initialState = Immutable({
  rule: {},
  ruleFetchStatus: '',
  rules: {},
  rulesFetchStatus: '',
  cluster: {},
  clusterFetchStatus: '',
});

export const getAdvisorStore = (previousState) => (
  state = previousState || initialState,
  action
) => {
  switch (action.type) {
    // RULE_FETCH
    case `${ActionTypes.RULE_FETCH}_PENDING`:
      return state.set('ruleFetchStatus', 'pending');
    case `${ActionTypes.RULE_FETCH}_FULFILLED`:
      return Immutable.merge(state, {
        rule: action.payload,
        ruleFetchStatus: 'fulfilled',
      });
    case `${ActionTypes.RULE_FETCH}_REJECTED`:
      return state.set('ruleFetchStatus', 'rejected');
    // RULES_FETCH
    case `${ActionTypes.RULES_FETCH}_PENDING`:
      return state.set('rulesFetchStatus', 'pending');
    case `${ActionTypes.RULES_FETCH}_FULFILLED`:
      return Immutable.merge(state, {
        rules: action.payload,
        rulesFetchStatus: 'fulfilled',
      });
    case `${ActionTypes.RULES_FETCH}_REJECTED`:
      return state.set('rulesFetchStatus', 'rejected');
    // CLUSTER_FETCH
    case `${ActionTypes.CLUSTER_FETCH}_PENDING`:
      return state.set('clusterFetchStatus', 'pending');
    case `${ActionTypes.CLUSTER_FETCH}_FULFILLED`:
      return Immutable.merge(state, {
        system: action.payload,
        clusterFetchStatus: 'fulfilled',
      });
    case `${ActionTypes.CLUSTER_FETCH}_REJECTED`:
      return state.set('clusterFetchStatus', 'rejected');
  }
};
