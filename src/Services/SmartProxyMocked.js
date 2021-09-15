import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// see https://github.com/RedHatInsights/insights-results-aggregator-mock
const BASE_URL = 'http://localhost:8080/api/insights-results-aggregator/v1';

export const SmartProxyMockedApi = createApi({
  reducerPath: 'smartProxyMocked',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  endpoints: (builder) => ({
    getAffectedClustersMocked: builder.query({
      query: (recId) => `rule/${recId}/clusters_detail`,
    }),
  }),
});

// Export hooks for usage in functional components
export const { useGetAffectedClustersMockedQuery } = SmartProxyMockedApi;
