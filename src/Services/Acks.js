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
      query: ({ ruleId } = {}) => ({ url: `/v2/ack/${ruleId}` }),
    }),
    setAck: build.mutation({
      query: ({ ruleId, justification } = {}) => ({
        url: '/v2/ack',
        body: {
          rule_id: ruleId,
          justification,
        },
        method: 'post',
      }),
    }),
  }),
});

const enableRuleForCluster = async ({ clusterId, ruleId } = {}) => {
  await Put(
    `${BASE_URL}/v1/clusters/${clusterId}/rules/${getPluginName(
      ruleId
    )}.report/error_key/${getErrorKey(ruleId)}/enable`
  );
};

const disableRuleForCluster = async ({
  clusterId,
  ruleId,
  justification = '',
} = {}) => {
  await Put(
    `${BASE_URL}/v1/clusters/${clusterId}/rules/${getPluginName(
      ruleId
    )}.report/error_key/${getErrorKey(ruleId)}/disable`
  );
  await Post(
    `${BASE_URL}/v1/clusters/${clusterId}/rules/${getPluginName(
      ruleId
    )}.report/error_key/${getErrorKey(ruleId)}/disable_feedback`,
    {},
    { message: justification }
  );
};

export const { useGetRecAcksQuery, useSetAckMutation } = Acks;
export { enableRuleForCluster, disableRuleForCluster };
