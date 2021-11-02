import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = '/api/insights-results-aggregator';

export const SmartProxyApi = createApi({
  reducerPath: 'smartProxy',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  endpoints: (builder) => ({
    getClusterById: builder.query({
      query: (id, includeDisabled = true) =>
        `v1/clusters/${id}/report?get_disabled=${includeDisabled}`,
    }),
    // Get rule's content using id (recId = recommendation id) in the rule_plugin_name|error_key format
    getRuleById: builder.query({
      query: (recId) => `v1/rules/${recId}/content`,
    }),
    getAffectedClusters: builder.query({
      query: (recId) => `v2/rule/${recId}/clusters_detail`,
      transformResponse: (response) => response?.data,
    }),
    getRecs: builder.query({
      query: () => `v2/rule`,
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetClusterByIdQuery,
  useLazyGetClusterByIdQuery,
  useGetRuleByIdQuery,
  useGetAffectedClustersQuery,
  useGetRecsQuery,
  useLazyGetRecsQuery,
} = SmartProxyApi;
