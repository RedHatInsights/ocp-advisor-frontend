import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClustersPdfBuild, { fetchData } from './ClustersPdfBuild';

describe('ClustersPdfBuild', () => {
  describe('fetchData', () => {
    it('calls createAsyncRequest with correct parameters', async () => {
      const mockCreateAsyncRequest = jest.fn().mockResolvedValue({
        data: [
          {
            cluster_id: '123',
            cluster_name: 'test-cluster',
            cluster_version: '4.14.0',
            total_hit_count: 5,
          },
        ],
        meta: {},
        status: 'ok',
      });
      const options = {
        filters: { limit: 50, offset: 0 },
      };

      await fetchData(mockCreateAsyncRequest, options);

      expect(mockCreateAsyncRequest).toHaveBeenCalledWith('advisor-backend', {
        method: 'GET',
        url: '/api/insights-results-aggregator/v2/clusters',
      });
    });

    it('returns data and options', async () => {
      const mockClustersData = [
        {
          cluster_id: '123',
          cluster_name: 'test-cluster',
        },
      ];
      const mockCreateAsyncRequest = jest.fn().mockResolvedValue({
        data: mockClustersData,
        meta: {},
        status: 'ok',
      });
      const options = { filters: {} };

      const result = await fetchData(mockCreateAsyncRequest, options);

      expect(result).toEqual({
        data: mockClustersData,
        options,
      });
    });
  });

  describe('ClustersPdfBuild component', () => {
    it('renders without crashing', () => {
      const asyncData = {
        data: {
          data: [
            {
              cluster_id: '123',
              cluster_name: 'test-cluster',
              version: '4.14.0',
              hits: 5,
              critical_hits: 1,
              important_hits: 2,
              moderate_hits: 1,
              low_hits: 1,
              last_seen: new Date().toISOString(),
            },
          ],
          options: { filters: {} },
        },
      };

      const { container } = render(<ClustersPdfBuild asyncData={asyncData} />);
      expect(container).toBeInTheDocument();
    });

    it('displays Red Hat Insights branding', () => {
      const asyncData = {
        data: {
          data: [],
          options: { filters: {} },
        },
      };

      const { container } = render(<ClustersPdfBuild asyncData={asyncData} />);
      expect(container).toHaveTextContent(/Red Hat Insights/);
      expect(container).toHaveTextContent(/OpenShift Advisor: Clusters/);
    });

    it('displays cluster count', () => {
      const asyncData = {
        data: {
          data: [
            {
              cluster_id: '1',
              cluster_name: 'c1',
              last_seen: new Date().toISOString(),
            },
            {
              cluster_id: '2',
              cluster_name: 'c2',
              last_seen: new Date().toISOString(),
            },
          ],
          options: { filters: {} },
        },
      };

      const { container } = render(<ClustersPdfBuild asyncData={asyncData} />);
      expect(container).toHaveTextContent(/Total Clusters/);
      expect(container).toHaveTextContent(/2/);
    });
  });
});
