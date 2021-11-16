import { createSlice } from '@reduxjs/toolkit';

export const AFFECTED_CLUSTERS_INITIAL_STATE = {
  limit: 10,
  offset: 0,
  text: '',
  sortIndex: -1,
  sortDirection: null,
};

export const RECS_LIST_INITIAL_STATE = {
  limit: 20,
  offset: 0,
  impacting: ['true'],
  sortIndex: 0,
  sortDirection: 'desc',
};

const filtersInitialState = {
  affectedClustersState: AFFECTED_CLUSTERS_INITIAL_STATE,
  recsListState: RECS_LIST_INITIAL_STATE,
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
    sortTableIndex(state, action) {
      state.recsListState.sortIndex = action.payload;
    },
    sortTableDirection(state, action) {
      state.recsListState.sortDirection = action.payload;
    },
  },
});

export const {
  updateAffectedClustersFilters,
  updateRecsListFilters,
  sortTableIndex,
  sortTableDirection,
} = filters.actions;

export default filters.reducer;
