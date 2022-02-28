import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = insights.chrome.isProd
  ? 'https://api.openshift.com/api/accounts_mgmt/v1'
  : 'https://api.stage.openshift.com/api/accounts_mgmt/v1';

export const AmsApi = createApi({
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
  }),
});
