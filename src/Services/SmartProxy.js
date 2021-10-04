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
    getRecs: builder.query({
      // ! SHOULD BE CHANGED TO A REAL ENDPOINT BEFORE RELEASE
      query: () => `content`,
      // ! ONLY USED TO TRANSFORM MOCKED DATA
      transformResponse: (response) =>
        response?.content.flatMap((current) => {
          const errorKeys = [];
          Object.entries(current.error_keys).forEach((entry) => {
            errorKeys.push({
              rule_id: current.plugin.python_module + '|' + entry[0],
              ...current.plugin,
              ...entry[1],
            });
          });
          return errorKeys;
        }),
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
