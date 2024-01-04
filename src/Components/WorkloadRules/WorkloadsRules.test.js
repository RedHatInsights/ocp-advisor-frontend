import {
  capitalize,
  createChips,
  pruneWorkloadsRulesFilters,
} from '../../Utilities/Workloads';

describe('capitalize function', () => {
  it('capitalizes the first letter of a string', () => {
    expect(capitalize('test')).toBe('Test');
    expect(capitalize('hello')).toBe('Hello');
  });
});

describe('createChips function', () => {
  it('creates chips with the correct format', () => {
    const category = {
      values: [
        { label: 'Label 1', value: '1' },
        { label: 'Label 2', value: '2' },
      ],
    };

    expect(createChips(category, '1')).toEqual({ name: 'Label 1', value: '1' });
    expect(createChips(category, '3')).toEqual({ name: '3', value: '3' });
  });
});

describe('pruneWorkloadsRulesFilters function', () => {
  it('prunes filters correctly', () => {
    const localFilters = {
      limit: 50,
      sortIndex: 1,
      sortDirection: 'desc',
      description: 'Sample Description',
      total_risk: [1, 2],
      object_id: '12345',
    };

    const filterCategories = {
      description: { label: 'Description', urlParam: 'description' },
      total_risk: {
        label: 'Total Risk',
        urlParam: 'total_risk',
        values: [
          { label: 'Critical', value: '4' },
          { label: 'Important', value: '3' },
          { label: 'Moderate', value: '2' },
          { label: 'Low', value: '1' },
        ],
      },
      object_id: { label: 'Object ID', urlParam: 'object_id' },
    };

    const result = pruneWorkloadsRulesFilters(localFilters, filterCategories);

    expect(result).toEqual([
      {
        category: 'Description',
        chips: [{ name: 'Sample Description', value: 'Sample Description' }],
        urlParam: 'description',
      },
      {
        category: 'Total Risk',
        chips: [
          { name: 'Low', value: 1 },
          { name: 'Moderate', value: 2 },
        ],
        urlParam: 'total_risk',
      },
      {
        category: 'Object ID',
        chips: [{ name: '12345', value: '12345' }],
        urlParam: 'object_id',
      },
    ]);
  });
});
