import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const BASE_URL = '/api/insights-results-aggregator';

export const SmartProxyApi = createApi({
  reducerPath: 'smartProxy',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: 3,
  endpoints: (builder) => ({
    getClusterById: builder.query({
      query: ({ clusterId, includeDisabled, preview } = {}) => ({
        url: `v2/cluster/${clusterId}/reports?get_disabled=${includeDisabled}`,
        params: {
          ...(preview ? { preview: true } : {}),
          get_disabled: includeDisabled,
        },
      }),
    }),
    // Get rule's content using id (recId = recommendation id) in the rule_plugin_name|error_key format
    getRuleById: builder.query({
      query: ({ ruleId, preview } = {}) => ({
        url: `v2/rule/${ruleId}`,
        params: {
          ...(preview ? { preview: true } : {}),
        },
      }),
    }),
    getAffectedClusters: builder.query({
      query: ({ ruleId, preview } = {}) => ({
        url: `v2/rule/${ruleId}/clusters_detail`,
        params: {
          ...(preview ? { preview: true } : {}),
        },
      }),
      transformResponse: (response) => response?.data,
    }),
    getRecs: builder.query({
      query: ({ preview } = {}) => ({
        url: `v2/rule`,
        params: {
          ...(preview ? { preview: true } : {}),
        },
      }),
    }),
    getClusters: builder.query({
      query: ({ preview } = {}) => ({
        url: `v2/clusters`,
        params: {
          ...(preview ? { preview: true } : {}),
        },
      }),
      transformResponse: (response) => {
        return {
          data: response.data.filter((element) => element.cluster_id !== ''),
        };
      },
    }),
    getClusterInfo: builder.query({
      query: ({ clusterId, preview } = {}) => ({
        url: `v2/cluster/${clusterId}/info`,
        params: {
          ...(preview ? { preview: true } : {}),
        },
      }),
      transformResponse: (response) => response?.cluster,
    }),
    getUpdateRisks: builder.query({
      query: ({ clusterId, preview } = {}) => ({
        url: `v2/cluster/${clusterId}/upgrade-risks-prediction`,
        params: {
          ...(preview ? { preview: true } : {}),
        },
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  endpoints: {
    getUpdateRisks: { useQueryState: useGetUpdateRisksState },
    getClusterInfo: { useQueryState: useGetClusterInfoState },
  },
  useGetClusterByIdQuery,
  useLazyGetClusterByIdQuery,
  useGetRuleByIdQuery,
  useGetAffectedClustersQuery,
  useGetRecsQuery,
  useLazyGetRecsQuery,
  useGetClustersQuery,
  useGetClusterInfoQuery,
  useGetUpdateRisksQuery,
} = SmartProxyApi;
