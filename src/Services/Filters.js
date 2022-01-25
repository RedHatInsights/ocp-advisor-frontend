import { createSlice } from '@reduxjs/toolkit';

// single recommendation page
export const AFFECTED_CLUSTERS_INITIAL_STATE = {
  limit: 20,
  offset: 0,
  text: '',
  sortIndex: -1,
  sortDirection: null,
};

// recommendations list page
export const RECS_LIST_INITIAL_STATE = {
  limit: 20,
  offset: 0,
  impacting: ['true'],
  // default sorting by total risk
  sortIndex: 4,
  sortDirection: 'desc',
  rule_status: 'enabled',
};

// clusters list page
export const CLUSTERS_LIST_INITIAL_STATE = {
  limit: 20,
  offset: 0,
  hits: ['all'],
  sortIndex: -1,
  sortDirection: 'desc',
  text: '',
};

// single cluster page
export const CLUSTER_RULES_INITIAL_STATE = {
  limit: 20,
  offset: 0,
  // default sorting by total risk
  sortIndex: -1,
  sortDirection: 'desc',
  text: '',
};

const filtersInitialState = {
  affectedClustersState: AFFECTED_CLUSTERS_INITIAL_STATE,
  recsListState: RECS_LIST_INITIAL_STATE,
  clustersListState: CLUSTERS_LIST_INITIAL_STATE,
  clusterRulesState: CLUSTER_RULES_INITIAL_STATE,
};

const filters = createSlice({
  name: 'filters',
  initialState: filtersInitialState,
  reducers: {
    // single recommendation page
    updateAffectedClustersFilters(state, action) {
      state.affectedClustersState = action.payload;
    },
    // recommendations list page
    updateRecsListFilters(state, action) {
      state.recsListState = action.payload;
    },
    // clusters list page
    updateClustersListFilters(state, action) {
      state.clustersListState = action.payload;
    },
    // single cluster page
    updateClusterRulesFilters(state, action) {
      state.clusterRulesState = action.payload;
    },
  },
});

export const {
  updateAffectedClustersFilters,
  updateRecsListFilters,
  updateRecsListSortIndex,
  updateRecListSortDirection,
  updateClustersListFilters,
  updateClusterRulesFilters,
} = filters.actions;

export default filters.reducer;
