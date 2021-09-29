import { createSlice } from '@reduxjs/toolkit';

const filtersInitialState = {
  affectedClustersState: {
    limit: 10,
    offset: 0,
    text: '',
    sortIndex: -1,
    sortDirection: null,
  },
};

const filters = createSlice({
  name: 'filters',
  initialState: filtersInitialState,
  reducers: {
    updateAffectedClustersFilters(state, action) {
      state.affectedClustersState = action.payload;
    },
  },
});

export const { updateAffectedClustersFilters } = filters.actions;

export default filters.reducer;
