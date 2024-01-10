import {
  capitalize,
  createChips,
  pruneWorkloadsRulesFilters,
  switchSort,
  sortWithSwitch,
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

// Mocking SortByDirection for testing purposes
const SortByDirection = {
  asc: 'asc',
  desc: 'desc',
};

describe('switchSort function', () => {
  test('should return details for sortIndex 1', () => {
    const item = [{ rule: { details: 'someDetails' } }];
    const result = switchSort(1, item);
    expect(result).toBe('someDetails');
  });

  test('should return total_risk for sortIndex 2', () => {
    const item = [{ rule: { total_risk: 42 } }];
    const result = switchSort(2, item);
    expect(result).toBe(42);
  });

  test('should return objects length for sortIndex 3', () => {
    const item = [{ rule: { objects: [1, 2, 3] } }];
    const result = switchSort(3, item);
    expect(result).toBe(3);
  });

  test('should return modified for sortIndex 4', () => {
    const item = [{ rule: { modified: '2024-01-10' } }];
    const result = switchSort(4, item);
    expect(result).toBe('2024-01-10');
  });

  test('should return 0 for invalid sortIndex', () => {
    const item = [{ rule: {} }];
    const result = switchSort(5, item);
    expect(result).toBe(0);
  });
});

describe('sortWithSwitch function', () => {
  test('should return original rows if sortIndex is invalid or firstRule is true', () => {
    const filteredRows = [{ rule: { details: 'abc' } }];
    const result = sortWithSwitch(5, SortByDirection.asc, filteredRows, false);
    expect(result).toEqual(filteredRows);
  });

  test('should sort rows in ascending order based on switchSort', () => {
    const filteredRows = [
      { rule: { details: 'abc' } },
      { rule: { details: 'xyz' } },
    ];
    const result = sortWithSwitch(1, SortByDirection.asc, filteredRows, false);
    expect(result).toEqual([
      { rule: { details: 'abc' } },
      { rule: { details: 'xyz' } },
    ]);
  });

  test('should sort rows in descending order based on switchSort', () => {
    const filteredRows = [
      { rule: { details: 'abc' } },
      { rule: { details: 'xyz' } },
    ];
    const result = sortWithSwitch(1, SortByDirection.desc, filteredRows, false);
    expect(result).toEqual([
      { rule: { details: 'abc' } },
      { rule: { details: 'xyz' } },
    ]);
  });
});
