import PropTypes from 'prop-types';
import React from 'react';
import { truncate } from 'lodash';
import { Flex, FlexItem } from '@patternfly/react-core';
import {
  t_global_color_nonstatus_red_default,
  t_global_text_color_regular,
} from '@patternfly/react-tokens';
import { InsightsLabel } from '@redhat-cloud-services/frontend-components/InsightsLabel';
import RecommendationCharts from './RecommendationCharts';

export const fetchData = async (createAsyncRequest, options) => {
  const statsReports = createAsyncRequest('advisor-backend', {
    method: 'GET',
    url: '/api/ocp-advisor/v1/stats/reports/',
  });

  const statsClusters = createAsyncRequest('advisor-backend', {
    method: 'GET',
    url: '/api/ocp-advisor/v1/stats/clusters/',
  });

  const topActiveRec = createAsyncRequest('advisor-backend', {
    method: 'GET',
    url: '/api/ocp-advisor/v1/rule/',
    params: {
      limit: options.limit || 3,
      sort: options.sort || '-total_risk,-impacted_count',
      impacting: options.impacting || true,
    },
  });

  const data = await Promise.all([statsReports, statsClusters, topActiveRec]);
  return data;
};

const BuildExecReport = ({ asyncData }) => {
  const [statsReports, statsClusters, topActiveRec] = asyncData.data;

  const calcPercent = (value, total) =>
    Math.round(Number((value / total) * 100));

  // Severity breakdown
  const severityRows = Object.entries(statsReports.total_risk)
    .map(([key, value]) => [
      ['Low', 'Moderate', 'Important', 'Critical'][parseInt(key) - 1],
      `${value} (${calcPercent(value, statsReports.total)}%)`,
    ])
    .reverse();

  // Category breakdown
  const categoryRows = Object.entries(statsReports.category || {}).map(
    ([key, value]) => [
      key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      `${value} (${calcPercent(value, statsReports.total)}%)`,
    ],
  );

  const rulesDesc = (rule) => (
    <span>
      <span style={{ fontWeight: 700 }}>{rule.description}</span>&nbsp;
      {truncate(rule.summary || '', { length: 280 })}
    </span>
  );

  return (
    <div
      style={{ paddingTop: '24px', paddingLeft: '32px', paddingRight: '32px' }}
    >
      <span
        style={{
          fontSize: '24px',
          color: t_global_color_nonstatus_red_default.value,
        }}
      >
        Red Hat Insights
      </span>
      <br />
      <span
        style={{
          fontSize: '32px',
          color: t_global_color_nonstatus_red_default.value,
        }}
      >
        Executive report: OpenShift Advisor
      </span>
      <br />
      <span style={{ fontSize: '12px' }}>
        This report summarizes {statsClusters.total} clusters with{' '}
        {statsReports.total} total recommendations.
      </span>
      <br />
      <br />
      <RecommendationCharts
        columnHeader="Severity"
        header="Recommendations by Severity"
        rows={severityRows}
      />
      <RecommendationCharts
        columnHeader="Category"
        header="Recommendations by Category"
        rows={categoryRows}
      />
      <span style={{ color: t_global_color_nonstatus_red_default.value }}>
        Top 3 Recommendations by Impact
      </span>
      {topActiveRec.data?.map((rule, key) => (
        <Flex style={{ paddingTop: '24px' }} key={key}>
          <Flex direction={{ default: 'column' }}>
            <FlexItem
              style={{
                fontSize: '12px',
                color: t_global_text_color_regular.value,
              }}
            >
              Clusters Exposed
            </FlexItem>
            <FlexItem style={{ fontSize: '32px' }}>
              {rule.impacted_clusters_count || rule.impacted_systems_count}
            </FlexItem>
          </Flex>
          <Flex direction={{ default: 'column' }}>
            <FlexItem
              style={{
                fontSize: '12px',
                color: t_global_text_color_regular.value,
              }}
            >
              Total Risk
            </FlexItem>
            <FlexItem style={{ paddingTop: '8px' }}>
              <InsightsLabel value={rule.total_risk} />
            </FlexItem>
          </Flex>
          <Flex
            flex={{ default: 'flex_1' }}
            alignSelf={{ default: 'alignSelfStretch' }}
          >
            <FlexItem style={{ fontSize: '12px' }}>{rulesDesc(rule)}</FlexItem>
          </Flex>
        </Flex>
      ))}
    </div>
  );
};

BuildExecReport.propTypes = {
  asyncData: PropTypes.object,
  additionalData: PropTypes.object,
};

export default BuildExecReport;
