import PropTypes from 'prop-types';
import React from 'react';
import { truncate } from 'lodash';
import { Flex, FlexItem } from '@patternfly/react-core';
import {
  t_color_red_50,
  t_global_text_color_regular,
} from '@patternfly/react-tokens';
import { InsightsLabel } from '@redhat-cloud-services/frontend-components/InsightsLabel';
import RecommendationCharts from './RecommendationCharts';

export const fetchData = async (createAsyncRequest, options) => {
  // Using the correct v2 endpoints from insights-results-aggregator
  const clusters = createAsyncRequest('advisor-backend', {
    method: 'GET',
    url: '/api/insights-results-aggregator/v2/clusters',
  });

  const recommendations = createAsyncRequest('advisor-backend', {
    method: 'GET',
    url: '/api/insights-results-aggregator/v2/rule',
  });

  const data = await Promise.all([clusters, recommendations]);
  const [clustersResponse, recsResponse] = data;

  // Calculate stats from the v2 responses
  // clustersResponse: { data: [{cluster_id, hits_by_total_risk: {"1": n, "2": n, ...}}, ...], meta: {...}, status: "ok" }
  // recsResponse: { recommendations: [{rule_id, total_risk, tags, impacted_clusters_count, ...}], status: "ok" }

  const clusterData = clustersResponse.data || [];
  const recData = recsResponse.recommendations || [];

  // Calculate total recommendations by severity (total_risk)
  const totalRiskCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  clusterData.forEach((cluster) => {
    const hitsByRisk = cluster.hits_by_total_risk || {};
    Object.keys(hitsByRisk).forEach((risk) => {
      totalRiskCounts[risk] = (totalRiskCounts[risk] || 0) + hitsByRisk[risk];
    });
  });

  // Calculate total recommendations by category (from tags)
  const categoryMap = {
    service_availability: 0,
    performance: 0,
    security: 0,
    fault_tolerance: 0,
  };
  recData.forEach((rec) => {
    (rec.tags || []).forEach((tag) => {
      if (categoryMap.hasOwnProperty(tag)) {
        categoryMap[tag] += rec.impacted_clusters_count || 0;
      }
    });
  });

  const totalRecs = Object.values(totalRiskCounts).reduce((a, b) => a + b, 0);

  const topRecs = recData
    .filter((rec) => !rec.disabled)
    .sort((a, b) => {
      if (b.total_risk !== a.total_risk) {
        return b.total_risk - a.total_risk;
      }
      return (
        (b.impacted_clusters_count || 0) - (a.impacted_clusters_count || 0)
      );
    })
    .slice(0, options.limit || 3);

  const statsReports = {
    total: totalRecs,
    total_risk: totalRiskCounts,
    category: categoryMap,
  };

  const statsClusters = {
    total: clusterData.length,
  };

  const topActiveRec = {
    data: topRecs,
  };

  return [statsReports, statsClusters, topActiveRec];
};

const BuildExecReport = ({ asyncData }) => {
  const [statsReports, statsClusters, topActiveRec] = asyncData.data;

  const calcPercent = (value, total) =>
    Math.round(Number((value / total) * 100));

  const severityRows = Object.entries(statsReports.total_risk)
    .map(([key, value]) => [
      ['Low', 'Moderate', 'Important', 'Critical'][parseInt(key) - 1],
      `${value} (${calcPercent(value, statsReports.total)}%)`,
    ])
    .reverse();

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
          color: t_color_red_50.value,
        }}
      >
        Red Hat Insights
      </span>
      <br />
      <span
        style={{
          fontSize: '32px',
          color: t_color_red_50.value,
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
      <span style={{ color: t_color_red_50.value }}>
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
