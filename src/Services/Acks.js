import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from './SmartProxy';

export const Acks = createApi({
  reducerPath: 'acks',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  endpoints: (build) => ({
    getRecAcks: build.query({
      query: (options) => ({ url: `/v2/ack/${options.ruleId}` }),
    }),
    setAck: build.mutation({
      query: (options) => ({
        url: '/v2/ack',
        body: options,
        method: 'post',
      }),
    }),
  }),
});

export const { useGetRecAcksQuery, useSetAckMutation } = Acks;
