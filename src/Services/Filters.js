import { createSlice } from '@reduxjs/toolkit';

export const AFFECTED_CLUSTERS_INITIAL_STATE = {
  limit: 20,
  offset: 0,
  text: '',
  sortIndex: -1,
  sortDirection: null,
};

export const RECS_LIST_INITIAL_STATE = {
  limit: 20,
  offset: 0,
  impacting: ['true'],
  // default sorting by total risk
  sortIndex: 3,
  sortDirection: 'desc',
  rule_status: 'enabled',
};

export const CLUSTERS_LIST_INITIAL_STATE = {
  limit: 20,
  offset: 0,
  hits: ['all'],
  sortIndex: -1,
  sortDirection: 'desc',
  text: '',
};

const filtersInitialState = {
  affectedClustersState: AFFECTED_CLUSTERS_INITIAL_STATE,
  recsListState: RECS_LIST_INITIAL_STATE,
  clustersListState: CLUSTERS_LIST_INITIAL_STATE,
};

const filters = createSlice({
  name: 'filters',
  initialState: filtersInitialState,
  reducers: {
    updateAffectedClustersFilters(state, action) {
      state.affectedClustersState = action.payload;
    },
    updateRecsListFilters(state, action) {
      state.recsListState = action.payload;
    },
    updateClustersListFilters(state, action) {
      state.clustersListState = action.payload;
    },
  },
});

export const {
  updateAffectedClustersFilters,
  updateRecsListFilters,
  updateRecsListSortIndex,
  updateRecListSortDirection,
  updateClustersListFilters,
} = filters.actions;

export default filters.reducer;
