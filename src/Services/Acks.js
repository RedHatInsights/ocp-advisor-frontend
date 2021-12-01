import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from './SmartProxy';

export const Acks = createApi({
  reducerPath: 'acks',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  endpoints: (build) => ({
    setAck: build.mutation({
      query: (options) => ({
        url: '/v2/ack',
        body: options,
        method: 'post',
      }),
    }),
  }),
});

export const { useSetAckMutation } = Acks;
