import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = 'https://api.openshift.com/api/accounts_mgmt/v1';

export const amsApi = createApi({
  reducerPath: 'ams',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: async (headers) => {
      await insights.chrome.auth.getUser();
      const token = await insights.chrome.auth.getToken();
      if (token) {
        /* AMS API accepts only Bearer token acquired from the production SSO.
         If you in non-prod env, fill in your prod token instead the `token` */
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getCurrentAccount: builder.query({
      query: () => `current_account`,
    }),
    getClusterDisplayNameById: builder.query({
      query: (clusterId) =>
        `subscriptions?page=1&size=-1&search=external_cluster_id='${clusterId}'&fields=display_name`,
      transformResponse: (response) => response?.items?.[0]?.display_name,
    }),
  }),
});

// Export hooks for usage in functional components
export const { useGetClusterDisplayNameByIdQuery } = amsApi;
