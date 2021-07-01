import * as ActionTypes from './AppConstants';

import API from './Utilities/Api';

const fetchData = async (url, headers, options, search) => {
  await insights.chrome.auth.getUser();
  const response = search
    ? await API.get(`${url}?${search}`, headers, options)
    : await API.get(`${url}`, headers, options);
  return response.data;
};

export const fetchCluster = (clusterId) => ({
  type: ActionTypes.CLUSTER_FETCH,
  payload: fetchData(ActionTypes.CLUSTER_FETCH_URL(clusterId)),
});
