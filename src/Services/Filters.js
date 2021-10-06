import { createSlice } from '@reduxjs/toolkit';

export const RECS_LIST_INITIAL_STATE = {
  limit: 10,
  offset: 0,
  impacting: ['true'],
  rule_status: 'enabled',
};

const filtersInitialState = {
  affectedClustersState: {
    limit: 10,
    offset: 0,
    text: '',
    sortIndex: -1,
    sortDirection: null,
  },
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
      console.log(action);
      state.recsListState = action.payload;
    },
  },
});

export const { updateAffectedClustersFilters, updateRecsListFilters } =
  filters.actions;

export default filters.reducer;
