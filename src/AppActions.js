import { createAsyncThunk } from '@reduxjs/toolkit';
import * as ActionTypes from './AppConstants';

import API from './Utilities/Api';

const fetchData = async (url, headers, options, search) => {
  await insights.chrome.auth.getUser();
  const response = search
    ? await API.get(`${url}?${search}`, headers, options)
    : await API.get(`${url}`, headers, options);
  return response.data;
};

export const fetchClusterById = createAsyncThunk(
  ActionTypes.CLUSTER_FETCH,
  async (clusterId) => fetchData(ActionTypes.CLUSTER_FETCH_URL(clusterId)),
  {
    // Here, arg is a cluster ID (https://redux-toolkit.js.org/api/createAsyncThunk#payloadcreator)
    condition: (arg, { getState }) => {
      const { clusters } = getState();
      const cluster = clusters[arg];
      if (
        cluster &&
        (cluster.fetchStatus === 'fulfilled' ||
          cluster.fetchStatus === 'pending')
      ) {
        // Already fetched or in progress, don't need to re-fetch
        return false;
      }
    },
    getPendingMeta: ({ arg, requestId }) => ({
      arg,
      requestId,
    }),
  }
);
