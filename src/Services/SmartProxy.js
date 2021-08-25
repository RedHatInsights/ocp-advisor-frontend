import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = '/api/insights-results-aggregator/v1';

export const smartProxyApi = createApi({
  reducerPath: 'smartProxy',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  endpoints: (builder) => ({
    getClusterById: builder.query({
      query: (id, includeDisabled = true) =>
        `clusters/${id}/report?get_disabled=${includeDisabled}`,
    }),
    // Get rule's content using id in the rule_plugin_name|error_key format
    getRuleById: builder.query({ query: (id) => `rules/${id}/content` }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetClusterByIdQuery,
  useLazyGetClusterByIdQuery,
  useGetRuleByIdQuery,
} = smartProxyApi;
