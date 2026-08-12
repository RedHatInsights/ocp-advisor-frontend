import { passFilterWorkloads } from './Tables';
import { sortBy } from 'lodash';

const filterItems = (workloads, filters) =>
  sortBy(
    workloads.filter((workload) => passFilterWorkloads(workload, filters)),
    (x) => x.cluster.uuid,
  );

describe('Tables', () => {
  describe('passFilterWorkloads', () => {
    const filters = { cluster_name: '', namespace_name: '' };

    const items = [
      {
        cluster: {
          uuid: '01',
          display_name: 'Cluster 1',
        },
        namespace: {
          uuid: '01',
          name: 'testspace',
        },
        metadata: {
          hits_by_severity: {
            1: 0,
            2: 500,
            3: 0,
            4: 0,
          },
        },
      },
      {
        cluster: {
          uuid: '02',
          display_name: 'Cluster 2',
        },
        namespace: {
          uuid: '01',
          name: 'testspace',
        },
        metadata: {
          hits_by_severity: {
            1: 0,
            2: 500,
            3: 0,
            4: 0,
          },
        },
      },
      {
        cluster: {
          uuid: '03',
          display_name: 'Cluster 3',
        },
        namespace: {
          uuid: '02',
          name: 'testspace 2',
        },
        metadata: {
          hits_by_severity: {
            1: 0,
            2: 500,
            3: 0,
            4: 0,
          },
        },
      },
    ];

    it('passes all items without filters', () => {
      expect(filterItems(items, filters)).toEqual(items);
    });

    it('filters based on cluster name', () => {
      const filters = { cluster_name: 'Cluster 1', namespace_name: '' };

      expect(filterItems(items, filters)).toEqual([
        expect.objectContaining({
          cluster: {
            uuid: '01',
            display_name: 'Cluster 1',
          },
        }),
      ]);
    });

    it('filters based on UUID without cluster name', () => {
      const items = [
        {
          cluster: {
            uuid: '01',
            display_name: '',
          },
          namespace: {
            uuid: '01',
            name: 'testspace',
          },
          metadata: {
            hits_by_severity: {
              1: 0,
              2: 500,
              3: 0,
              4: 0,
            },
          },
        },
        {
          cluster: {
            uuid: '02',
            display_name: '',
          },
          namespace: {
            uuid: '01',
            name: 'testspace',
          },
          metadata: {
            hits_by_severity: {
              1: 0,
              2: 500,
              3: 0,
              4: 0,
            },
          },
        },
      ];

      const filters = {
        cluster_name: '01',
        namespace_name: '',
      };

      expect(filterItems(items, filters)).toEqual([
        expect.objectContaining({
          cluster: {
            uuid: '01',
            display_name: '',
          },
        }),
      ]);
    });

    it('filters based on UUID with cluster name', () => {
      const filters = {
        cluster_name: '01',
        namespace_name: '',
      };

      expect(filterItems(items, filters)).toEqual([
        expect.objectContaining({
          cluster: {
            uuid: '01',
            display_name: 'Cluster 1',
          },
        }),
      ]);
    });

    it('filters based on namespace name', () => {
      const filters = { cluster_name: '', namespace_name: 'testspace 2' };

      expect(filterItems(items, filters)).toEqual([
        expect.objectContaining({
          namespace: {
            uuid: '02',
            name: 'testspace 2',
          },
        }),
      ]);
    });

    it('filters based on UUID without namespace name', () => {
      const items = [
        {
          cluster: {
            uuid: '01',
            display_name: 'Cluster 1',
          },
          namespace: {
            uuid: '01',
            name: '',
          },
          metadata: {
            hits_by_severity: {
              1: 0,
              2: 500,
              3: 0,
              4: 0,
            },
          },
        },
        {
          cluster: {
            uuid: '02',
            display_name: 'Cluster 2',
          },
          namespace: {
            uuid: '02',
            name: '',
          },
          metadata: {
            hits_by_severity: {
              1: 0,
              2: 500,
              3: 0,
              4: 0,
            },
          },
        },
      ];

      const filters = {
        cluster_name: '',
        namespace_name: '01',
      };

      expect(filterItems(items, filters)).toEqual([
        expect.objectContaining({
          namespace: {
            uuid: '01',
            name: '',
          },
        }),
      ]);
    });

    it('filters based on UUID with namespace name', () => {
      const filters = {
        cluster_name: '',
        namespace_name: '02',
      };

      expect(filterItems(items, filters)).toEqual([
        expect.objectContaining({
          namespace: {
            uuid: '02',
            name: 'testspace 2',
          },
        }),
      ]);
    });
  });
});
