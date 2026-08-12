import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import BuildExecReport, { fetchData } from './BuildExecReport';

describe('BuildExecReport', () => {
  describe('fetchData', () => {
    it('calls createAsyncRequest for all required endpoints', async () => {
      const mockClustersResponse = {
        data: [
          {
            cluster_id: '1',
            hits_by_total_risk: { 1: 10, 2: 20, 3: 30, 4: 40 },
          },
        ],
        meta: {},
        status: 'ok',
      };
      const mockRecommendationsResponse = {
        recommendations: [
          {
            rule_id: 'rule1',
            total_risk: 4,
            impacted_clusters_count: 15,
            disabled: false,
            tags: ['performance', 'security'],
          },
        ],
        status: 'ok',
      };

      const mockCreateAsyncRequest = jest
        .fn()
        .mockResolvedValueOnce(mockClustersResponse)
        .mockResolvedValueOnce(mockRecommendationsResponse);

      const options = {
        limit: 3,
        sort: '-total_risk,-impacted_count',
        impacting: true,
      };

      await fetchData(mockCreateAsyncRequest, options);

      expect(mockCreateAsyncRequest).toHaveBeenCalledTimes(2);
      expect(mockCreateAsyncRequest).toHaveBeenCalledWith('ccx-smart-proxy', {
        method: 'GET',
        url: '/api/insights-results-aggregator/v2/clusters',
      });
      expect(mockCreateAsyncRequest).toHaveBeenCalledWith('ccx-smart-proxy', {
        method: 'GET',
        url: '/api/insights-results-aggregator/v2/rule',
      });
    });

    it('returns array of data', async () => {
      const mockClustersResponse = {
        data: [
          {
            cluster_id: '1',
            hits_by_total_risk: { 1: 10, 2: 20, 3: 30, 4: 40 },
          },
        ],
        status: 'ok',
      };
      const mockRecommendationsResponse = {
        recommendations: [
          {
            rule_id: 'rule1',
            total_risk: 4,
            impacted_clusters_count: 15,
            disabled: false,
            tags: ['performance'],
          },
        ],
        status: 'ok',
      };

      const mockCreateAsyncRequest = jest
        .fn()
        .mockResolvedValueOnce(mockClustersResponse)
        .mockResolvedValueOnce(mockRecommendationsResponse);

      const result = await fetchData(mockCreateAsyncRequest, {});

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('total');
      expect(result[0]).toHaveProperty('total_risk');
      expect(result[0]).toHaveProperty('category');
      expect(result[1]).toHaveProperty('total');
      expect(result[2]).toHaveProperty('data');
    });

    it('calculates stats correctly from v2 API responses', async () => {
      const mockClustersResponse = {
        data: [
          {
            cluster_id: '1',
            hits_by_total_risk: { 1: 10, 2: 20, 3: 30, 4: 40 },
          },
          {
            cluster_id: '2',
            hits_by_total_risk: { 1: 5, 2: 10, 3: 15, 4: 20 },
          },
        ],
        status: 'ok',
      };
      const mockRecommendationsResponse = {
        recommendations: [
          {
            rule_id: 'rule1',
            total_risk: 4,
            impacted_clusters_count: 15,
            disabled: false,
            tags: ['performance', 'security'],
          },
          {
            rule_id: 'rule2',
            total_risk: 3,
            impacted_clusters_count: 10,
            disabled: false,
            tags: ['service_availability'],
          },
        ],
        status: 'ok',
      };

      const mockCreateAsyncRequest = jest
        .fn()
        .mockResolvedValueOnce(mockClustersResponse)
        .mockResolvedValueOnce(mockRecommendationsResponse);

      const result = await fetchData(mockCreateAsyncRequest, {});

      // Check statsReports
      expect(result[0].total).toBe(150); // Sum of all hits
      expect(result[0].total_risk).toEqual({ 1: 15, 2: 30, 3: 45, 4: 60 });

      // Check statsClusters
      expect(result[1].total).toBe(2);

      // Check topActiveRec
      expect(result[2].data).toHaveLength(2);
      expect(result[2].data[0].total_risk).toBe(4); // Sorted by total_risk desc
    });
  });

  describe('BuildExecReport component', () => {
    it('renders without crashing', () => {
      const asyncData = {
        data: [
          {
            total: 100,
            total_risk: { 1: 10, 2: 20, 3: 30, 4: 40 },
            category: { performance: 50, security: 50 },
          },
          { total: 25 },
          { data: [] },
        ],
      };

      const { container } = render(<BuildExecReport asyncData={asyncData} />);
      expect(container).toBeInTheDocument();
    });

    it('displays Red Hat Insights branding', () => {
      const asyncData = {
        data: [
          { total: 0, total_risk: {}, category: {} },
          { total: 0 },
          { data: [] },
        ],
      };

      const { container } = render(<BuildExecReport asyncData={asyncData} />);
      expect(container).toHaveTextContent(/Red Hat Insights/);
      expect(container).toHaveTextContent(
        /Executive report: OpenShift Advisor/,
      );
    });

    it('displays cluster and recommendation summary', () => {
      const asyncData = {
        data: [
          {
            total: 150,
            total_risk: { 1: 30, 2: 40, 3: 50, 4: 30 },
            category: {},
          },
          { total: 25 },
          { data: [] },
        ],
      };

      const { container } = render(<BuildExecReport asyncData={asyncData} />);
      expect(container).toHaveTextContent(/25 clusters/);
      expect(container).toHaveTextContent(/150 total recommendations/);
    });

    it('renders top recommendations', () => {
      const asyncData = {
        data: [
          { total: 100, total_risk: {}, category: {} },
          { total: 25 },
          {
            data: [
              {
                description: 'Critical Security Vulnerability',
                summary: 'A critical security issue',
                total_risk: 4,
                impacted_clusters_count: 15,
              },
            ],
          },
        ],
      };

      const { container } = render(<BuildExecReport asyncData={asyncData} />);
      expect(container).toHaveTextContent(/Top 3 Recommendations by Impact/);
      expect(container).toHaveTextContent(/Critical Security Vulnerability/);
      expect(container).toHaveTextContent(/15/);
    });
  });
});
