import { createSlice } from '@reduxjs/toolkit';

const filtersInitialState = {
  affectedClustersState: {
    limit: 10,
    offset: 0,
    text: '',
    sortIndex: -1,
    sortDirection: null,
  },
  recsListState: {
    limit: 10,
    offset: 0,
    text: '',
  },
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
  },
});

export const { updateAffectedClustersFilters, updateRecsListFilters } =
  filters.actions;

export default filters.reducer;
