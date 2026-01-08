import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import BuildExecReport, { fetchData } from './BuildExecReport';

describe('BuildExecReport', () => {
  describe('fetchData', () => {
    it('calls createAsyncRequest for all required endpoints', async () => {
      const mockStatsReports = {
        total: 100,
        total_risk: { 1: 10, 2: 20, 3: 30, 4: 40 },
        category: {},
      };
      const mockStatsClusters = { total: 25 };
      const mockTopRec = { data: [] };

      const mockCreateAsyncRequest = jest
        .fn()
        .mockResolvedValueOnce(mockStatsReports)
        .mockResolvedValueOnce(mockStatsClusters)
        .mockResolvedValueOnce(mockTopRec);

      const options = {
        limit: 3,
        sort: '-total_risk,-impacted_count',
        impacting: true,
      };

      await fetchData(mockCreateAsyncRequest, options);

      expect(mockCreateAsyncRequest).toHaveBeenCalledTimes(3);
      expect(mockCreateAsyncRequest).toHaveBeenCalledWith('advisor-backend', {
        method: 'GET',
        url: '/api/ocp-advisor/v1/stats/reports/',
      });
      expect(mockCreateAsyncRequest).toHaveBeenCalledWith('advisor-backend', {
        method: 'GET',
        url: '/api/ocp-advisor/v1/stats/clusters/',
      });
      expect(mockCreateAsyncRequest).toHaveBeenCalledWith('advisor-backend', {
        method: 'GET',
        url: '/api/ocp-advisor/v1/rule/',
        params: options,
      });
    });

    it('returns array of data', async () => {
      const mockData = [{ total: 100 }, { total: 25 }, { data: [] }];
      const mockCreateAsyncRequest = jest
        .fn()
        .mockResolvedValueOnce(mockData[0])
        .mockResolvedValueOnce(mockData[1])
        .mockResolvedValueOnce(mockData[2]);

      const result = await fetchData(mockCreateAsyncRequest, {});

      expect(result).toEqual(mockData);
    });

    it('uses default values for options', async () => {
      const mockCreateAsyncRequest = jest.fn().mockResolvedValue({});

      await fetchData(mockCreateAsyncRequest, {});

      expect(mockCreateAsyncRequest).toHaveBeenCalledWith(
        'advisor-backend',
        expect.objectContaining({
          params: {
            limit: 3,
            sort: '-total_risk,-impacted_count',
            impacting: true,
          },
        }),
      );
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
