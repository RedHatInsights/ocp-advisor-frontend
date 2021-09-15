import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = '/api/insights-results-aggregator/v1';

export const SmartProxyApi = createApi({
  reducerPath: 'smartProxy',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  endpoints: (builder) => ({
    getClusterById: builder.query({
      query: (id, includeDisabled = true) =>
        `clusters/${id}/report?get_disabled=${includeDisabled}`,
    }),
    // Get rule's content using id (recId = recommendation id) in the rule_plugin_name|error_key format
    getRuleById: builder.query({
      query: (recId) => `rules/${recId}/content`,
    }),
    getAffectedClusters: builder.query({
      query: (recId) => `rule/${recId}/clusters_detail`,
      transformResponse: (response) => response?.data,
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetClusterByIdQuery,
  useLazyGetClusterByIdQuery,
  useGetRuleByIdQuery,
  useGetAffectedClustersQuery,
} = SmartProxyApi;
