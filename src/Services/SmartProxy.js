import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = '/api/insights-results-aggregator/v1';

export const smartProxyApi = createApi({
  reducerPath: 'smartProxy',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  endpoints: (builder) => ({
    getClusterById: builder.query({
      query: (id) => `clusters/${id}/report`,
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetClusterByIdQuery,
  useLazyGetClusterByIdQuery,
} = smartProxyApi;
