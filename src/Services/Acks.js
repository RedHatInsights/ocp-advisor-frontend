import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getErrorKey, getPluginName } from '../Utilities/Rule';
import { BASE_URL } from './SmartProxy';
import { Post, Put } from '../Utilities/Api';

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

const enableRuleForCluster = async ({ uuid, recId }) => {
  await Put(
    `${BASE_URL}/v1/clusters/${uuid}/rules/${getPluginName(
      recId
    )}.report/error_key/${getErrorKey(recId)}/enable`
  );
};

const disableRuleForCluster = async ({ uuid, recId, justification = '' }) => {
  await Put(
    `${BASE_URL}/v1/clusters/${uuid}/rules/${getPluginName(
      recId
    )}.report/error_key/${getErrorKey(recId)}/disable`
  );
  await Post(
    `${BASE_URL}/v1/clusters/${uuid}/rules/${getPluginName(
      recId
    )}.report/error_key/${getErrorKey(recId)}/disable_feedback`,
    {},
    { message: justification }
  );
};

export const { useGetRecAcksQuery, useSetAckMutation } = Acks;
export { enableRuleForCluster, disableRuleForCluster };
