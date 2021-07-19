import { createReducer } from '@reduxjs/toolkit';
import { fetchClusterById } from './AppActions';

const initialState = {
  clusters: {},
};

const getAdvisorStore = (previousState = initialState) =>
  createReducer(previousState, (builder) => {
    // CLUSTER_FETCH
    builder.addCase(fetchClusterById.pending, (state, action) => {
      state.clusters = {
        [String(action.meta.arg)]: { fetchStatus: 'pending' },
      };
    });
    builder.addCase(fetchClusterById.fulfilled, (state, action) => {
      state.clusters = {
        [String(action.meta.arg)]: {
          fetchStatus: 'fulfilled',
          data: action.payload,
        },
      };
    });
    builder.addCase(fetchClusterById.rejected, (state, action) => {
      state.clusters = {
        [String(action.meta.arg)]: {
          fetchStatus: 'rejected',
        },
      };
    });
  });

export default getAdvisorStore;
